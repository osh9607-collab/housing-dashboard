exports.handler = async (event) => {
  const params = event.queryStringParameters || {};
  
  const orgId = params.orgId || '116';
  const tblId = params.tblId || 'DT_MLTM_1946';
  const prdSe = params.prdSe || 'M';
  const startPrdDe = params.startPrdDe || '202001';
  const endPrdDe = params.endPrdDe || '202612';
  const API_KEY = 'MTI0YzJmMjQzNTg1OGQwYzczNTEzYmY2NDk3MGQxY2Q=';

  const query = new URLSearchParams({
    method: 'getList',
    apiKey: API_KEY,
    itmId: 'ALL',
    objL1: 'ALL',
    objL2: 'ALL',
    objL3: '', objL4: '', objL5: '', objL6: '', objL7: '', objL8: '',
    format: 'json',
    jsonVD: 'Y',
    prdSe,
    startPrdDe,
    endPrdDe,
    orgId,
    tblId,
  });

  const url = `https://kosis.kr/openapi/Param/statisticsParameterData.do?${query}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(data),
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message }),
    };
  }
};
