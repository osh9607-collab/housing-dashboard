const https = require('https');
 
exports.handler = async (event) => {
  const params = event.queryStringParameters || {};
  const orgId = params.orgId || '116';
  const tblId = params.tblId || 'DT_MLTM_1946';
  const prdSe = params.prdSe || 'M';
  const startPrdDe = params.startPrdDe || '200701';
  const endPrdDe = params.endPrdDe || '202612';
  const API_KEY = 'MTI0YzJmMjQzNTg1OGQwYzczNTEzYmY2NDk3MGQxY2Q=';
 
  // 통계표별 파라미터 분기
  let itmId, objParams;
 
  if (tblId === 'DT_MLTM_1948') {
    // 주택유형별 인허가 - C1=시도, C2=대분류, C3=중분류, C4=소분류
    itmId = '13103871090T1+';
    objParams = 'objL1=ALL&objL2=ALL&objL3=ALL&objL4=ALL&objL5=&objL6=&objL7=&objL8=';
  } else {
    // DT_MLTM_1946 부문별 인허가 - 서울(C3) 고정
    itmId = '13103871089T1+';
    objParams = 'objL1=ALL&objL2=ALL&objL3=13102871089C.0002&objL4=&objL5=&objL6=&objL7=&objL8=';
  }
 
  const url = `https://kosis.kr/openapi/Param/statisticsParameterData.do?method=getList&apiKey=${API_KEY}&itmId=${itmId}&${objParams}&format=json&jsonVD=Y&prdSe=${prdSe}&startPrdDe=${startPrdDe}&endPrdDe=${endPrdDe}&orgId=${orgId}&tblId=${tblId}`;
 
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
            body: JSON.stringify(parsed)
          });
        } catch (e) {
          resolve({
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
            body: data
          });
        }
      });
    }).on('error', (err) => {
      resolve({
        statusCode: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: err.message })
      });
    });
  });
};
