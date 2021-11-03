var http = require("http");    // HTTPモジュールの読み込み

http.createServer(function(request, response) {    //  HTTPサーバを作成
   response.writeHead(200, {'Content-Type': 'text/plain'});    // レスポンスHTTPヘッダーを設定
   response.end('Test Page\n');    // レスポンスボディを送信
}).listen(8000);    // ポート8000でリクエストを行う

//  サーバにアクセスするためのURLを出力
console.log('Server running at http://127.0.0.1:8000/');
