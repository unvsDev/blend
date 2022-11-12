// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: pink; icon-glyph: angle-down;
// Blend Installer - developed by unvsDev

let service = await new Request("https://github.com/unvsDev/blend/raw/main/service.json").loadJSON()
let latestVersion = service.latestVersion

let alert = new Alert()
alert.title = "Blend 설치하기"
alert.message = "버전 " + latestVersion + "을 기기에 설치합니다.\n이미 Blend를 설치했을 경우, 임의로 수정한 내용이 유실될 수 있습니다."
alert.addAction("확인")
alert.addCancelAction("취소")

let response = await alert.presentAlert()
if(response == -1){ return 0 }

let alert2 = new Alert()
alert2.title = "설치할 파일 이름을 입력하세요"
alert2.message = "파일 확장자는 자동으로 포함됩니다."
alert2.addTextField("Blend 위젯", latestVersion == "1.5.1" ? "blend-widget" : `Blend Widget v${latestVersion}`)
alert2.addTextField("Blend 런처", latestVersion == "1.5.1" ? "blend" : `Blend Launcher v${latestVersion}`)
alert2.addAction("확인")
alert2.addCancelAction("취소")

let response2 = await alert2.presentAlert()
if(response2 == -1){ return 0 }

let names = [alert2.textFieldValue(0), alert2.textFieldValue(1)]

let widgetSource = await new Request(`https://github.com/unvsDev/blend/releases/download/${latestVersion}/blend-widget.js`).loadString()
let launcherSource = await new Request(`https://github.com/unvsDev/blend/releases/download/${latestVersion}/blend.js`).loadString()

let fm = FileManager.iCloud()
await fm.writeString(`${fm.documentsDirectory()}/${names[0]}.js`, widgetSource)
await fm.writeString(`${fm.documentsDirectory()}/${names[1]}.js`, launcherSource)

let alert3 = new Alert()
alert3.title = "설치 도우미를 제거할까요?"
alert3.message = "이후 수동으로 설치가 필요할 경우, 계속 사용할 수 있습니다."
alert3.addDestructiveAction("지금 제거하기")
alert3.addCancelAction("유지")

let response3 = await alert3.presentAlert()
if(response3 == 0){ await fm.remove(`${fm.documentsDirectory()}/${Script.name()}.js`) }
Safari.open(encodeURI(`scriptable:///run?scriptName=${names[1]}`))

return 0