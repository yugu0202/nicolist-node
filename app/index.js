const puppeteer = require('puppeteer');
const fetch = require('node-fetch-commonjs');

process.stdin.setEncoding("utf8");
const reader = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout
});

const _sleep = (ms) => new Promise((resolve) => setTimeout(resolve,ms));

const HEADER = {"User-Agent":"nicolist"}
const ROOT_URL = "https://www.nicovideo.jp";
const LOGIN_URL = "https://account.nicovideo.jp/login";
const USER_EMAIL = "applerin1119@gmail.com";
const USER_PASS = "rem-0202";

//ログイン処理
async function Login(page)
{
  await page.goto(LOGIN_URL,{waitUntil: "domcontentloaded"});

  await page.type("input[name='mail_tel']",USER_EMAIL);
  await page.type("input[name='password']",USER_PASS);
  await Promise.all([
    page.waitForNavigation({waitUntil: "domcontentloaded"}),
    page.click("input[id='login__submit']"),
  ]);
};

async function Input(display)
{
  return new Promise ((resolve,reject) => {
    reader.question(display,(answer) => {
      resolve(answer);
      reader.close();
    });
  })
};

//APIにコール
async function CallApi(url)
{
  const res = await fetch(url,{headers: HEADER});
  const ret = await res.json();

  return ret;
};

//htmlからのデータ取得
async function MainScraping(url,title,mylistCount,mylistName,page)
{
  if (parseInt(mylistCount/500) >= 1)
  {
    let name = `${mylistName}その${parseInt(mylistCount/500)+1}`;
  }
  else
  {
    let name = mylistName;
  }
}

//無名関数を作って即時実行
async function Add()
{
  let tag = await Input("tag>");
  let count = 0;
  const apiUrl = `https://api.search.nicovideo.jp/api/v2/snapshot/video/contents/search?q=${tag}&targets=tagsExact&fields=contentId,title&_sort=%2BstartTime&_offset=${count*100}&_limit=100&_context=nicolist`;

  const browser = await puppeteer.launch({args: ['--no-sandbox','--disable-setuid-sandbox']});
  const page = await browser.newPage();

  await Login(page);

  let response = await CallApi(apiUrl);
  let dataList = [];
  for (let movieInfo of response["data"])
  {
    dataList.push(["/watch/"+movieInfo["contentId"],movieInfo["title"]]);
  };
  let maxLoop = Math.ceil(response["meta"]["totalCount"]/100);

  count = 1
  while (count <= maxLoop)
  {
    await _sleep(1000);
    response = await CallApi(apiUrl);
    for (let movieInfo of response["data"])
    {
      dataList.push(["/watch/"+movieInfo["contentId"],movieInfo["title"]]);
    };
    count += 1;
  }

  for (let data of dataList)
  {
    console.log(data[0].slice(9,17)+"start");
    //マイリスト追加済みかチェックする
    //if Authentication

    mylistCount = await MainScraping()
  }

  await page.screenshot({path: 'example.png'});

  await browser.close();
};

Add();
