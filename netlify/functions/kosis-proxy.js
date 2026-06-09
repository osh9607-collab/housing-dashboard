const https = require('https');
 
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch(e) { resolve(data); }
      });
    }).on('error', reject);
  });
}
 
const API_KEY = 'MTI0YzJmMjQzNTg1OGQwYzczNTEzYmY2NDk3MGQxY2Q=';
 
const TBL_CONFIG = {
  // 인허가 (월별누계 → 순증 변환 필요)
  'DT_MLTM_1948': {
    itmId: '13103871090T1+',
    objL: 'objL1=13102871090A.0003&objL2=ALL&objL3=ALL&objL4=ALL&objL5=&objL6=&objL7=&objL8=',
    orgId: '116', split: true,
  },
  // 착공 (월계 - 변환 불필요)
  'DT_MLTM_5387': {
    itmId: '13103766969T1+',
    objL: 'objL1=13102766969A.0003&objL2=ALL&objL3=ALL&objL4=ALL&objL5=&objL6=&objL7=&objL8=',
    orgId: '116', split: true,
  },
  // 준공 (월계 - 변환 불필요)
  'DT_MLTM_5373': {
    itmId: '13103766973T1+',
    objL: 'objL1=13102766973A.0003&objL2=ALL&objL3=ALL&objL4=ALL&objL5=&objL6=&objL7=&objL8=',
    orgId: '116', split: true,
  },
  // 멸실 (연간)
  'DT_MLTM_5416': {
    itmId: '13103883384T1+13103883384T2+13103883384T3+13103883384T4+13103883384T5+13103883384T6+',
    objL: 'objL1=ALL&objL2=&objL3=&objL4=&objL5=&objL6=&objL7=&objL8=',
    orgId: '116', split: false, prdSe: 'Y', startPrdDe: '2010', endPrdDe: '2024',
  },
  // 매매가격지수
  'DT_KAB_11672_S7': {
    itmId: 'T1+T2+',
    objL: 'objL1=ALL&objL2=&objL3=&objL4=&objL5=&objL6=&objL7=&objL8=',
    orgId: '408', split: false, startPrdDe: '201301',
  },
  // 매매거래량
  'DT_408_2006_S0061': {
    itmId: '13103114445T1+13103114445T2+',
    objL: 'objL1=ALL&objL2=ALL&objL3=&objL4=&objL5=&objL6=&objL7=&objL8=',
    orgId: '408', split: false, startPrdDe: '201301',
  },
  // 중위가격
  'DT_KAB_11672_S18': {
    itmId: 'T001+',
    objL: 'objL1=ALL&objL2=&objL3=&objL4=&objL5=&objL6=&objL7=&objL8=',
    orgId: '408', split: false, startPrdDe: '201301',
  },
  // 평균가격
  'DT_KAB_11672_S17': {
    itmId: 'T001+',
    objL: 'objL1=ALL&objL2=&objL3=&objL4=&objL5=&objL6=&objL7=&objL8=',
    orgId: '408', split: false, startPrdDe: '201301',
  },
};
 
exports.handler = async (event) => {
  const params = event.queryStringParameters || {};
  const tblId = params.tblId || 'DT_MLTM_1948';
  const cfg = TBL_CONFIG[tblId];
 
  if (!cfg) {
    return { statusCode: 400, headers: {'Access-Control-Allow-Origin':'*'}, body: JSON.stringify({error:'Unknown tblId'}) };
  }
 
  const orgId = cfg.orgId || '116';
  const prdSe = cfg.prdSe || 'M';
  const now = new Date();
  const defaultEnd = prdSe === 'Y' ? String(now.getFullYear()-1) : `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}`;
  const endPrdDe = cfg.endPrdDe || defaultEnd;
 
  try {
    let result;
 
    if (cfg.split) {
      const startYear = 2013;
      const endYear = parseInt(endPrdDe.slice(0,4));
      const ranges = [];
      for (let y = startYear; y <= endYear; y += 5) {
        ranges.push([`${y}01`, `${Math.min(y+4, endYear)}12`]);
      }
      const results = await Promise.all(ranges.map(([s, e]) => {
        const url = `https://kosis.kr/openapi/Param/statisticsParameterData.do?method=getList&apiKey=${API_KEY}&itmId=${cfg.itmId}&${cfg.objL}&format=json&jsonVD=Y&prdSe=${prdSe}&startPrdDe=${s}&endPrdDe=${e}&orgId=${orgId}&tblId=${tblId}`;
        return fetchUrl(url);
      }));
      for (const r of results) {
        if (r?.err) throw new Error(r.errMsg || JSON.stringify(r));
      }
      result = results.flat();
    } else {
      const startPrdDe = cfg.startPrdDe || '201301';
      const url = `https://kosis.kr/openapi/Param/statisticsParameterData.do?method=getList&apiKey=${API_KEY}&itmId=${cfg.itmId}&${cfg.objL}&format=json&jsonVD=Y&prdSe=${prdSe}&startPrdDe=${startPrdDe}&endPrdDe=${endPrdDe}&orgId=${orgId}&tblId=${tblId}`;
      result = await fetchUrl(url);
    }
 
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify(result)
    };
  } catch(e) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: e.message })
    };
  }
};
