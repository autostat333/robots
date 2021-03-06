module.exports = {
    'HOST':'localhost',
    'PORT':3001,
    'DATABASE':'robots',
    'ROUND_INTERVAL':60000, //in ms
    'REQUESTS_INTERVAL':5000, //in ms
    'REQUEST_TIMEOUT':10000, //timeout for http requests
    'ATTEMPTS':10, //number of attempts for resending the requests to proxy and robot
    'SECRET':'andrii',
    'DB_USER_NAME':'', //for connection to MongoDB
    'DB_USER_PASS':'',
    'SOCKET_URL':'crawlers.top', //url for establish ws connection
    'PROXY_USER':'',  //user and password for proxy access
    'PROXY_PASS':''

}
