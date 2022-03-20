const puppeteer = require('puppeteer');
const fetch = require('node-fetch-commonjs');

const ROOT_URL = "https://www.nicovideo.jp";
const LOGIN_URL = "https://account.nicovideo.jp/login";
const USER_EMAIL = "applerin1119@gmail.com";
const USER_PASS = "rem-0202";

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

async function CallApi(url)
{
  const res = await fetch(url);
  const ret = await res.json();

  return ret;
}

(async () => {
  const tag = "test";
  const count = 0;
  const url = `https://api.search.nicovideo.jp/api/v2/snapshot/video/contents/search?q=${tag}&targets=tagsExact&fields=contentId,title&_sort=%2BstartTime&_offset=${count*100}&_limit=10&_context=Hiziki`;
  console.log(url);

  const browser = await puppeteer.launch({args: ['--no-sandbox','--disable-setuid-sandbox']});
  const page = await browser.newPage();

  await Login(page);

  console.log(await CallApi(url));

  await page.screenshot({path: 'example.png'});

  await browser.close();
})();
