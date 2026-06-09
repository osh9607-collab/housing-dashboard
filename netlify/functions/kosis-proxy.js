const https = require('https');

function fetchKosis(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch(e) { resolve(data); }
      });
    }).on('error', reject);
  });
}

exports.handler = async (event) => {
  const params = event.queryStringParameters || {};
  const orgId = params.orgId || '116';
  const tblId = params.tblId || 'DT_MLTM_1946';
  const prdSe = params.prdSe || 'M';
  const endPrdDe = params.endPrdDe || '202612';
  const API_KEY = 'MTI0YzJmMjQzNTg1OGQwYzczNTEzYmY2NDk3MGQxY2Q=';

  try {
    let result;

    if (tblId === 'DT_MLTM_1948') {
      // 분할 호출: 2013~2017, 2018~2022, 2023~현재
      const itmId = '13103871090T1+';
      const objParams = 'objL1=13102871090A.0003&objL2=ALL&objL3=ALL&objL4=ALL&objL5=&objL6=&objL7=&objL8=';
      const ranges = [
        ['201301', '201712'],
        ['201801', '202212'],
        ['202301', endPrdDe],
      ];

      const results = await Promise.all(ranges.map(([start, end]) => {
        const url = `https://kosis.kr/openapi/Param/statisticsParameterData.do?method=getList&apiKey=${API_KEY}&itmId=${itmId}&${objParams}&format=json&jsonVD=Y&prdSe=${prdSe}&startPrdDe=${start}&endPrdDe=${end}&orgId=${orgId}&tblId=${tblId}`;
        return fetchKosis(url);
      }));

      // 에러 체크
      for (const r of results) {
        if (r?.err) throw new Error(r.errMsg || JSON.stringify(r));
      }

      // 배열 합치기
      result = results.flat();

    } else {
      // DT_MLTM_1946 단일 호출
      const startPrdDe = params.startPrdDe || '200701';
      const itmId = '13103871089T1+';
      const objParams = 'objL1=ALL&objL2=ALL&objL3=13102871089C.0002&objL4=&objL5=&objL6=&objL7=&objL8=';
      const url = `https://kosis.kr/openapi/Param/statisticsParameterData.do?method=getList&apiKey=${API_KEY}&itmId=${itmId}&${objParams}&format=json&jsonVD=Y&prdSe=${prdSe}&startPrdDe=${startPrdDe}&endPrdDe=${endPrdDe}&orgId=${orgId}&tblId=${tblId}`;
      result = await fetchKosis(url);
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
