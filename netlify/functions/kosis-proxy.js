const https = require('https');

exports.handler = async (event) => {
  const params = event.queryStringParameters || {};

  const orgId = params.orgId || '116';
  const tblId = params.tblId || 'DT_MLTM_1946';
  const prdSe = params.prdSe || 'M';
  const startPrdDe = params.startPrdDe || '202001';
  const endPrdDe = params.endPrdDe || '202612';
  const API_KEY = 'MTI0YzJmMjQzNTg1OGQwYzczNTEzYmY2NDk3MGQxY2Q=';

  const url = `https://kosis.kr/openapi/Param/statisticsParameterData.do?method=getList&apiKey=${API_KEY}&itmId=ALL&objL1=ALL&objL2=&objL3=&objL4=&objL5=&objL6=&objL7=&objL8=&format=json&jsonVD=Y&prdSe=${prdSe}&startPrdDe=${startPrdDe}&endPrdDe=${endPrdDe}&newEstPrdCnt=12&orgId=${orgId}&tblId=${tblId}`;

  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({
            statusCode: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify(parsed),
          });
        } catch(e) {
          resolve({
            statusCode: 500,
            body: JSON.stringify({ error: 'parse failed', raw: data.slice(0, 500) }),
          });
        }
      });
    }).on('error', (e) => {
      resolve({
        statusCode: 500,
        body: JSON.stringify({ error: e.message }),
      });
    });
  });
};
