// 下半分だけを切り取るffmpegコマンドを実行する関数を追加
import { exec } from 'child_process'

function cropBottomHalf(input = 'recording.webm', output = 'recording_bottom.webm') {
    const cmd = `ffmpeg -y -i ${input} -filter:v "crop=in_w:in_h/2:0:in_h/2" -c:a copy ${output}`
    return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                reject(stderr)
            } else {
                resolve(stdout)
            }
        })
    })
}

import puppeteer from 'puppeteer'
import { setTimeout } from 'node:timers/promises'

const browser = await puppeteer.launch({
    defaultViewport: {width: 1080, height: 1024},
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
})
const [page] = await browser.pages()
const recorder = await page.screencast({ path: 'recording.webm' })

try {
    await page.goto('https://secure.xserver.ne.jp/xapanel/login/xserver/')
    await page.locator('#memberid').fill(process.env.EMAIL)
    await page.locator('#user_password').fill(process.env.PASSWORD)
    await page.click('text=ログインする')
    await page.waitForNavigation()
    await page.goto('https://secure.xserver.ne.jp/xapanel/xvps/index')
    await page.click('.contract__menuIcon')
    await page.click('text=契約情報')
    await page.click('text=更新する')
    await page.click('text=引き続き無料VPSの利用を継続する')
    await page.waitForNavigation()
    await page.click('text=無料VPSの利用を継続する')
} catch (e) {
    console.error(e)
} finally {
    await setTimeout(2000)
    await recorder.stop()
    await browser.close()
    // 録画ファイルの下半分だけを切り取る
    try {
        await cropBottomHalf()
        console.log('recording_bottom.webm を作成しました')
    } catch (e) {
        console.error('ffmpegでの切り取りに失敗:', e)
    }
}
