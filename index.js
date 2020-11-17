const fetch = require('node-fetch');
const cheerio = require('cheerio');
const delay = require('delay');
const readline = require("readline");
const ask = prompt => new Promise(resolve => {
  const rl = readline.createInterface({input: process.stdin, output: process.stdout});
  rl.question(prompt, input => {
    rl.close();
    resolve(input);
  });
});

async function main() {
  const url = await ask("ひら皮膚科クリニックのQRコードから読み取ったURL: ");
  while (true) {
    const res = await fetch(url, {
      method: "GET",
      mode: "cors",
      credentials: "include",
      headers: {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        "accept-encoding": "gzip, deflate, br",
        "accept-language": "ja",
        "connection": "keep-alive",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "none",
        "upgrade-insecure-requests": "1",
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.183 Safari/537.36",
      },
    });
    if (!res.ok) {
      throw new Error("not ok");
    }
    const html = await res.text();
    const $ = cheerio.load(html);
    const wait_number_str = $('.info_cell').filter(':contains("待ち人数")').find('.wait_number').text();
    if (wait_number_str) {
      const wait_number = Number(wait_number_str);
      console.log("待ち人数: " + wait_number);
      if (wait_number <= 3) {
        console.log("診察室へ向かってください");
        for (let i = 0; i < 10; ++i) {
          console.log("\x07");
          await delay(100);
        }
      }
    } else {
      const text_danger = $('.text-danger').text();
      throw new Error(text_danger || "HTMLパース失敗");
    }
    await delay(3000);
  }
}

main().catch(err => console.log(err));
