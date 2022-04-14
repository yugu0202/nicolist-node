const puppeteer = require('puppeteer');
const fetch = require('node-fetch-commonjs');

process.stdin.setEncoding("utf8");
const reader = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout
});

const _sleep = (ms) => new Promise((resolve) => setTimeout(resolve,ms));

const HEADER = {"User-Agent":"nicolist"};
const BASE_URL = "https://www.nicovideo.jp";
const LOGIN_URL = "https://account.nicovideo.jp/login";
const USER_EMAIL = "";
const USER_PASS = "";

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
  const ret = await (await fetch(url,{headers:HEADER})).json();

  return ret;
};

async function TagCheck(title,tag,page)
{
  let check = false;
  while (true)
  {
    let access = await page.$eval("h1",item => item.textContent);

    if (access != title)
    {
      console.log("error page");
      await _sleep(60000);
      await page.reload({waitUntil:"networkidle2"});
    }
    else
    {
      break;
    }
  };

  let lookTagList = await page.$$("*[class^='TagItem is-locked']");

  for (let lookTag of lookTagList)
  {
    let tagName = await lookTag.$eval("a[class='Link TagItem-name']",item => item.textContent);

    if (tagName.toLowerCase() == tag)
    {
      check = true;
      break;
    };
  };

  console.log(`tag check:${check}`);
  return check;
};

async function MylistCheck(name,page)
{
  let check;
  let button = await page.$("button.ActionButton.VideoMenuContainer-button");
  await button.click();

  await page.screenshot({path: 'ml.png'});

  if (await page.$(`*[data-mylist-name='${name}']`))
  {
    check = true;
  }
  else
  {
    check = false;
  }

  await button.click();
  console.log(`mylistCheck:${check}`);
  return check;
};

async function MylistCreate(name,page)
{
  let createUrl = "https://www.nicovideo.jp/my/mylist";
  await page.goto(createUrl,{waitUntil: 'networkidle2'});

  await page.click('button.ModalActionButton.MylistsContainer-actionItem');

  await page.$eval("input[name='title']", element => element.value = '');
  await page.type("input[name='title']",name);

  await page.click('label.RadioItem-label');
  await page.click('button.ModalContent-footerSubmitButton');

  console.log("mylist create");
};

async function MylistAdd(name,page)
{
  await page.click('button.ActionButton.VideoMenuContainer-button');
  await page.screenshot({path: 'ml.png'});
  await page.click(`*[data-mylist-name='${name}']`);
  await page.click("button.ActionButton.AddMylistModal-submit");
  console.log(`mylist add ${name}`);
}

//htmlからのデータ取得
async function MainScraping(url,title,tag,mylistCount,mylistName,page)
{
  let name;
  if (Math.floor(mylistCount/500) >= 1)
  {
    name = `${mylistName}その${Math.floor(mylistCount/500)+1}`;
  }
  else
  {
    name = mylistName;
  }

  await page.goto(BASE_URL + url,{waitUntil:"networkidle2"});

  if (await TagCheck(title,tag,page) == true)
  {
    if (! await MylistCheck(mylistName,page))
    {
      await MylistCreate(name,page);
      await page.goto(BASE_URL + url,{waitUntil:"networkidle2"});
    }
    await MylistAdd(name,page);
  }

  await _sleep(10000);
};

async function Add()
{
  let tag = await Input("tag>");
  let count = 0;
  const apiUrl = `https://api.search.nicovideo.jp/api/v2/snapshot/video/contents/search?q=${tag}&targets=tagsExact&fields=contentId,title&_sort=%2BstartTime&_offset=${count*100}&_limit=100&_context=nicolist`;

  const browser = await puppeteer.launch({args: ['--no-sandbox','--disable-setuid-sandbox']});
  const page = await browser.newPage();
  page.setViewport({width: 1200, height: 800});

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

    mylistCount = await MainScraping(data[0],data[1],tag,0,tag,page);
  }

  await page.screenshot({path: 'example.png'});

  await browser.close();
};

Add();
