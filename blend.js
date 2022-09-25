// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: moon;
const version = "1.4.1"
let dtDate = new Date()
let dt = dtDate.getTime()

if(config.runsInWidget){
  let widget = new ListWidget()
  widget.backgroundColor = Color.black()
  
  let symbol = widget.addImage(getSymbolImage("clear", 26))
  symbol.imageSize = new Size(26,26)
  symbol.tintColor = Color.white()
  symbol.centerAlignImage()
  
  widget.addSpacer(5)
  
  let text = widget.addText("위젯 길게 누르기 → 위젯 편집 → Script → Blend Widget 선택")                 
  text.font = Font.boldSystemFont(16)
  text.textColor = Color.white()
  text.centerAlignText()
  
  Script.setWidget(widget)
  return 0
}

let fm = FileManager.iCloud()
let mdir = fm.documentsDirectory()
let fpath = {
  "dir": `${mdir}/blend`,
  "model": `${mdir}/blend/model.json`,
  "data": `${mdir}/blend/prefs.json`,
  
  "wall": `${mdir}/terrace.json`,
  
  "adir": `${mdir}/blendAssets`,
  "wdir": `${mdir}/blendAssets/wallpapers`,
}

let data = {
  "identifiers": [],
}

let modelorigin = {
  "id": dt,
  
  "bgmode": 0,
  "bgid": [0, 0],
  "bghex": "000000",
  
  "bgResIndex": -1, // DisplayResolutionIndex
  
  "devid": -1,
  
  "updateCache": dt,
  "service": -1,
  
  "showBorder": 0,
  "stackWidth": 310,
  "widgetScriptName": "blend-widget",
  
  "modelVer": "1.4",
}

let requiredPaths = ["dir", "adir", "wdir"]

for(index in fpath){
  if(requiredPaths.indexOf(index) != -1 && !fm.fileExists(fpath[index])){
    fm.createDirectory(fpath[index])
  } else if(index == "model" && !fm.fileExists(fpath[index])){
    fm.writeString(fpath[index], JSON.stringify(modelorigin))
  } else if(fm.isFileStoredIniCloud(fpath[index]) && !fm.isFileDownloaded(fpath[index])){
    try {
      await fm.downloadFileFromiCloud(fpath[index])
    } catch(e){
      throw new Error("누락된 파일 다운로드 실패. 네트워크 환경을 확인해주세요.")
    }
  } else if(index == "data" && fm.fileExists(fpath[index])){
    data = JSON.parse(fm.readString(fpath[index]))
  }
}

data.origin = {
  "bgmode": -1,
  "bgid": [0, 0],
  "bghex": "000000",
  "useSeperateBg": 0,
  
  "pos": 10,
  
  "desc": "",
  "devc": "",
  
  "modified": dt,
  "activated": 0,
  
  "displayMode": 0,
  "itmAlignment": 1,
  "itmSpacerOffset": 0,
  "itmRepeatOffset": 5,
  "stackOpacity": 0.15,
  
  "calendars": [],
  "reminders": [],
  
  "calendarTwoRow": 1,
  "calendarLength": 4,
  "reminderLength": 3,
  "showAllDayEvents": 1,
  "distanceEventStartDate": 7,
  "delayHideEventsMin": 5,
  "eventDurationMethod": 0,
  "showLateReminders": 0,
  "showForTimedReminders": 0,
  "showTodayReminders": 0,
  "sortReminderByTime": 0,
  "setCalendarView": 0,
  
  // Service Cache
  "locations": {},
  "appleWeather": {},
  "openWeather": {},
  "covidMohw": {},
  
  "delayPositionCacheMin": 10,
  "delayWeatherCacheMin": 10,
  "apwdTemp": 1,
  "apwdSolarMovement": 1,
  "apwdDetail": 0,
  "apwdHourly": 1,
  "apwdDaily": 1,
  
  "apwdPressure": 1,
  "apwdHumidity": 1,
  "apwdApparentTemp": 1,
  "apwdPrecip": 1,
  "apwdWindSpeed": 1,
  "apwdUvIndex": 1,
  
  "weatherCtoF": 0,
  "weatherAlternativeDesc": 1,
  
  "recentPositionRefresh": 0,
  "recentWeatherRefresh": 0,
  
  "covidRegion": 1,
  "covidCache": 0,
  "covidShowDetail": 0,
  
  "widgetPadding": [0, 0, 0, 0],
  "layout": [],
  
  "showBattery": 0,
  
  "textColor": ["FFFFFF", "FFFFFF"],
  "textSize": [16, 13, 12],
  "textOpacity": 1,
  "iconSize": 14,
  
  "dateFormat": "M월 d일 E요일",
  "timeFormat": "a h:mm",
  "locale": "ko-kr",
  "forceLoadService": 0,
  
  "textString": "",
  "textString2": "",
  
  "spacer5": 0,
  "spacer6": 0,
  
  "quickMemo": [],
  
  // TextProperty
  // fontIndex, customFontName, fontSize
  "_simpleText": [1, "", 27],
  "_simpleText2": [1, "", 27],
  
  "_dateText": [4, "", 13],
  
  "_noEventText": [4, "", 15],
  "_dateMarker": [4, "", 11],
  "_eventTitle": [1, "", 13],
  "_eventDuration": [5, "", 12],
  
  "_reminderTitle": [1, "", 12],
  "_reminderDate": [5, "", 12],
  
  "_covidTitle": [4, "", 13],
  
  "_awSolarText": [4, "", 10],
  "_awDetailText": [4, "", 12],
  
  "_quickMemoText": [4, "", 13],
}

const fonts = ["custom", "boldSystem", "boldMonospaced", "boldRounded", "mediumSystem", "mediumMonospaced", "mediumRounded", "lightSystem", "lightMonospaced", "lightRounded"]
const fontsDesc = ["커스텀 폰트", "Bold", "고정 폭 Bold", "모서리가 둥근 Bold", "Medium", "고정 폭 Medium", "모서리가 둥근 Medium", "Light", "고정 폭 Light", "모서리가 둥근 Light"]

let model = JSON.parse(fm.readString(fpath.model))

if(data[model.id] == undefined){
  data.identifiers.push(model.id)
  data[model.id] = JSON.parse(JSON.stringify(data.origin))
} else {
  let temp = JSON.parse(JSON.stringify(data.origin))
  for(i in data[model.id]){ if(temp[i] != undefined){ temp[i] = data[model.id][i] } }
  data[model.id] = JSON.parse(JSON.stringify(temp))
}

for(i in model){ if(modelorigin[i] != undefined){ modelorigin[i] = model[i] } }
model = JSON.parse(JSON.stringify(modelorigin))

let mindex = data.identifiers.indexOf(model.id)
data[model.id].modified = dt

// SharedWallpaper
async function setupTerrace(){
  if(fm.isFileStoredIniCloud(fpath.wall) && !fm.isFileDownloaded(fpath.wall)){
    try {
      await fm.downloadFileFromiCloud(fpath.wall)
    } catch(e){
      throw new Error("누락된 파일 다운로드 실패. 네트워크 환경을 확인해주세요.")
    }
  }
  
  return fm.fileExists(fpath.wall) ? JSON.parse(fm.readString(fpath.wall)) : {}
}

let terrace = await setupTerrace()

if(args.queryParameters.authsource){
  await Keychain.set("blend-appleweather-auth", atob(args.queryParameters.authsource))
  
  let alert = new Alert()
  alert.title = "Apple 날씨"
  alert.message = "등록이 완료되었습니다."
  alert.addAction("확인")
  await alert.presentAlert()
}

// Check Update every 4hr+
if(dt - model.updateCache > 1000 * 60 * 60 * 4 || model.service == -1){
  try{
    model.service = await new Request("https://raw.githubusercontent.com/unvsDev/blend/main/service.json").loadJSON()
    model.updateCache = dt
  } catch(e){
    model.updateCache = dt - 1000 * 60 * 60 * 2 // Retry 2hr+
  }
}

let rdf = new RelativeDateTimeFormatter()
rdf.locale = "ko-kr"; rdf.useNumericDateTimeStyle();

function cropImage(img, rect) {
  let draw = new DrawContext()
  draw.size = new Size(rect.w, rect.h)
  draw.drawImageAtPoint(img, new Point(-rect.x, -rect.y))
  return draw.getImage()
}

function getSymbolImage(code, imageSize){
  let sfs = SFSymbol.named(code)
  sfs.applyFont(Font.systemFont(imageSize))
  return sfs.image
}

// setup end


async function showLauncher(){
  let main = new UITable()
  main.showSeparators = true
  
  let isParameterCopied = false
  
  function loadMain(){
    if(model.service != null){
      if(model.service.latestVersion != version){
        let updateRow = new UITableRow()
        updateRow.height = 65
        updateRow.dismissOnSelect = false
        
        let updateText = updateRow.addText(`위젯 업데이트가 가능합니다 → 버전 ${model.service.latestVersion}`, "여기를 눌러 업데이트")
        updateText.titleFont = Font.semiboldSystemFont(15)
        updateText.titleColor = Color.blue()
        
        updateText.subtitleColor = Color.gray()
        updateText.subtitleFont = Font.systemFont(14)
        
        main.addRow(updateRow)
        
        updateRow.onSelect = async () => {
          let alert = new Alert()
          alert.title = "업데이트를 지금 설치할까요?"
          alert.message = "최신 버전의 Blend 위젯 및 런처를 기기에 덮어씁니다. 소스 코드를 직접 수정했을 경우, 해당 파일의 복사본을 별도로 저장하십시오.\n이 과정은 네트워크 연결이 필요합니다."
          alert.addAction("확인")
          alert.addCancelAction("취소")

          let r = await alert.presentAlert()

          if(r != -1){
            saveAllData()
            fm.writeString(fpath.wall, JSON.stringify(terrace))

            let widgetCode = await new Request(`https://github.com/unvsDev/blend/releases/download/${model.service.latestVersion}/blend-widget.js`).loadString()
            let launcherCode = await new Request(`https://github.com/unvsDev/blend/releases/download/${model.service.latestVersion}/blend.js`).loadString()
            
            await fm.writeString(`${mdir}/blend-widget.js`, widgetCode)
            await fm.writeString(`${mdir}/blend.js`, launcherCode)

            Safari.open(URLScheme.forRunningScript())
            return 0
          }
        }
      }
    }
    
    let titleRow = new UITableRow()
    titleRow.height = 120
    
    let title = titleRow.addText("Blend", `버전 ${version}`)
    title.widthWeight = 46
    title.titleFont = Font.boldSystemFont(24)
    title.subtitleFont = Font.systemFont(14)
    
    let authBt = titleRow.addButton("연결")
    authBt.widthWeight = 18
    authBt.rightAligned()
    
    authBt.onTap = async () => {
      await showAuthTable()
    }
    
    let wallBt = titleRow.addButton("배경")
    wallBt.widthWeight = 18
    wallBt.rightAligned()
    
    wallBt.onTap = async () => {
      await showWallTable()
    }
    
    let confBt = titleRow.addButton("구성 " + (mindex + 1))
    confBt.widthWeight = 18
    confBt.rightAligned()
    
    confBt.onTap = async () => {
      await showConfigTable()
    }
    
    main.addRow(titleRow)
    
    let installRow = new UITableRow()
    installRow.dismissOnSelect = false
    if(isParameterCopied){ installRow.height = 65 }
    
    let installText = installRow.addText((new Date().getTime() - data[model.id].activated < 1800000 ? "✓ " : "") + (isParameterCopied ? "복사 완료" : ("홈 화면에 " + "구성 " + (mindex + 1) + " 추가")), isParameterCopied ? "위젯 길게 누르기 → 위젯 편집 → Parameter → 값 입력" : null)
    installText.titleColor = Color.blue()
    
    installText.subtitleColor = Color.gray()
    installText.subtitleFont = Font.systemFont(14)
    
    installRow.onSelect = async () => {
      await Pasteboard.copyString(model.id.toString())
      isParameterCopied = true
      refreshMain()
    }
    
    main.addRow(installRow)
    
    let previewRow = new UITableRow()
    let previewText = previewRow.addText("위젯 미리보기")
    previewText.titleColor = Color.blue()
    
    previewRow.onSelect = () => {
      Safari.open(`scriptable:///run?scriptName=${encodeURI(model.widgetScriptName)}&wid=${model.id}`)
    }
    
    main.addRow(previewRow)
    
    function addRowElement(title, code){
      let row = new UITableRow()
      row.dismissOnSelect = false
      
      let text = row.addText(title)
      
      row.onSelect = async () => {
        await eval(`show${code}Table()`)
      }
      
      main.addRow(row)
    }
    
    addRowElement("위젯 위치", "Pos")
    addRowElement("레이아웃", "Layout")
    addRowElement("캘린더와 미리 알림", "Event")
    addRowElement("날씨", "Weather")
    addRowElement("코로나19 정보", "Covid")
    addRowElement("일반 설정", "Misc")
    addRowElement("도움말과 팁", "Help")
  }
  
  function refreshMain(){
    main.removeAllRows()
    loadMain()
    main.reload()
  }
  
  loadMain()
  await main.present()
  
  // AuthTable
  async function showAuthTable(){
    let table = new UITable()
    table.showSeparators = true
    
    eval(editorElements)
    
    let layout = {
      "header": "날씨",
      "blend-appleweather": ["Apple WeatherKit", "Apple 날씨",
        "유효한 JWT 방식의 토큰을 입력하십시오."],
      "blend-openweather": ["OpenWeather", "OpenWeather 날씨",
        "유효한 API 키를 입력하십시오."],
    
    }
    
    function loadTable(){
      for(index in layout){
        if(index == "header"){
          addPropertyHeader(layout[index])
          continue
        }
        
        let row = new UITableRow()
        row.height = 65
        row.dismissOnSelect = false
        
        let text = row.addText((Keychain.contains(index) ? "✓ " : "") + layout[index][0], layout[index][1])
        text.subtitleColor = Color.gray()
        text.subtitleFont = Font.systemFont(14)
        
        row.onSelect = async (number) => {
          let key = Object.keys(layout)[number]
          
          let alert = new Alert()
          alert.title = layout[key][0]
          alert.message = layout[key][2]
          alert.addTextField("여기에 붙여넣기", "")
          alert.addAction("확인")
          await alert.presentAlert()
          
          if(alert.textFieldValue() == ""){
            throw -1
          }
          
          await Keychain.set(key, alert.textFieldValue())
          refreshTable()
        }
        
        table.addRow(row)
      }
      
      let removeRow = new UITableRow()
      let removeText = removeRow.addText("모든 키체인 정보 삭제")
      removeText.titleColor = Color.red()
      
      removeRow.onSelect = async () => {
        for(index in layout){
          if(Keychain.contains(index)){ await Keychain.remove(index) }
        }
        
        let hiddenKeys = ["blend-appleweather-auth"]
        
        for(index in hiddenKeys){
          if(Keychain.contains(hiddenKeys[index])){ await Keychain.remove(hiddenKeys[index]) }
        }
        
        let alert = new Alert()
        alert.title = "삭제가 완료되었습니다."
        alert.message = "이후 서비스를 이용하려면 연결 정보를 다시 입력해야 합니다."
        alert.addAction("확인")
        await alert.presentAlert()
      }
      
      table.addRow(removeRow)
    }
    
    
    function refreshTable(){
      table.removeAllRows()
      loadTable()
      table.reload()
    }
    
    loadTable()
    await table.present()
  }
  
  // WallTable
  async function showWallTable(){
    let table = new UITable()
    table.showSeparators = true
    
    let pmode; let pid; let phex;
    
    function setPValues(){
      if(data[model.id].useSeperateBg){
        pmode = data[model.id].bgmode
        pid = data[model.id].bgid
        phex = data[model.id].bghex
      } else {
        pmode = model.bgmode
        pid = model.bgid
        phex = model.bghex
      }
    }
    
    function savePValues(){
      if(data[model.id].useSeperateBg){
        data[model.id].bgmode = pmode
        data[model.id].bgid = pid
        data[model.id].bghex = phex
      } else {
        model.bgmode = pmode
        model.bgid = pid
        model.bghex = phex
      }
    }
    
    async function saveParts(height, code, img){
      let phone = phoneSizes[height]
      if(phone.length > 1){ phone = phone[model.bgResIndex] }
      
      let partsDir = `${fpath.wdir}/${code}`
      if(!fm.fileExists(partsDir)){ fm.createDirectory(partsDir) }
      
      let k = 0
      let rect = {"x":0,"y":0,"w":0,"h":0}
      let sizes = ["small", "medium", "large"]
      let positions = [["top-left", "top-right", "middle-left", "middle-right", "bottom-left", "bottom-right"], ["top-left", "middle-left", "bottom-left"], ["top-left", "middle-left"]]
      for(let i = 0; i < sizes.length; i++){
        let size = sizes[i]
        rect.w = phone[size].w
        rect.h = phone[size].h
        
        for(let j = 0; j < positions[i].length; j++){
          rect.x = phone[positions[i][j].split("-")[1]]
          rect.y = phone[positions[i][j].split("-")[0]]
          k++
          await fm.writeImage(`${partsDir}/${k}.jpg`, cropImage(img, rect))
        }
      }
    }
    
    async function loadPhoto(title){
      let img = await Photos.fromLibrary()
      
      let now = new Date().getTime()
      let orgPath = `${fpath.wdir}/${now}.jpg`
      
      if(pmode == 1){
        let height = img.size.height
        if(!phoneSizes[height]){
          let alert = new Alert()
          alert.title = "오류"
          alert.message = "해당 스크린샷을 지원하지 않음"
          alert.addAction("확인")
          await alert.presentAlert()
          throw -1
        } else if(phoneSizes[height].length > 1 && model.bgResIndex == -1){
          let alert = new Alert()
          for(i in phoneSizes[height]){
            alert.addAction(phoneSizes[height][i].models.join(', '))
          }
          model.bgResIndex = await alert.presentAlert()
        }
        
        await saveParts(height, now, img)
        
        terrace[now] = {
          "desc": title,
          "height": height
        }
      }
      
      await fm.writeImage(orgPath, img)
    }
    
    async function showImagePicker(){
      let picker = new UITable()
      picker.showSeparators = true
      
      function loadPicker(){
        let flist = fm.listContents(fpath.wdir)
        
        for(index in terrace){
          let row = new UITableRow()
          row.height = 65
          row.dismissOnSelect = false
          
          let desc
          if(pid[0] == index){
            desc = pid[1] == index ? "둘 다 설정" : "라이트 모드"
          } else if(pid[1] == index){
            desc = "다크 모드"
          }
          
          if(flist.indexOf(`${index}.jpg`) == -1){ desc = "파일을 찾을 수 없음" }
          
          let text = row.addText((desc ? "✓ " : "") + terrace[index].desc, desc)
          text.subtitleColor = Color.gray()
          text.subtitleFont = Font.systemFont(14)
          
          let button = row.addButton("⚙️")
          button.rightAligned()
          
          let temp = parseInt(index).toString()
          
          button.onTap = async () => {
            let phone = phoneSizes[terrace[temp].height]
            try{
              if(phone.length > 1){
                if(model.bgResIndex == -1){ throw -1 }
                phone = phone[model.bgResIndex]
              }
            } catch(e){
              let alert = new Alert()
              alert.title = "해상도를 확인할 수 없음"
              alert.message = "선택 후 부분 이미지 재생성을 권장합니다."
              for(i in phone){
                alert.addAction(phone[i].models.join(', '))
              }
              model.bgResIndex = await alert.presentAlert()
              phone = phone[model.bgResIndex]
            }
            
            let alert = new Alert()
            alert.title = terrace[temp].desc
            alert.message = "적용 기기: " + phone.models[0] + "와 같은 해상도"
            alert.addAction("미리보기")
            alert.addAction("이름 편집")
            alert.addDestructiveAction("부분 이미지 재생성")
            alert.addDestructiveAction("이미지 삭제")
            alert.addCancelAction("취소")
            let r = await alert.presentAlert()
            
            if(r == 0){
              QuickLook.present(fm.readImage(`${fpath.wdir}/${temp}.jpg`))
            } else if(r == 1){
              let alert2 = new Alert()
              alert2.title = "이미지 이름 입력"
              alert2.addTextField("", terrace[temp].desc)
              alert2.addAction("확인")
              alert2.addCancelAction("취소")
              let r = await alert2.presentAlert()
              if(r != -1){ terrace[temp].desc = alert2.textFieldValue() }
            } else if(r == 2){
              await saveParts(terrace[temp].height, temp, fm.readImage(`${fpath.wdir}/${temp}.jpg`))
              let alert3 = new Alert()
              alert3.title = "재생성 완료"
              alert3.addAction("확인")
              await alert3.presentAlert()
            } else if(r == 3){
              if(fm.fileExists(`${fpath.wdir}/${temp}.jpg`)){ fm.remove(`${fpath.wdir}/${temp}.jpg`) }
              if(fm.fileExists(`${fpath.wdir}/${temp}`)){ fm.remove(`${fpath.wdir}/${temp}`) }
              delete terrace[temp]
            }
            
            refreshPicker()
          }
          
          row.onSelect = async (number) => {
            let alert = new Alert()
            alert.addAction("라이트 모드")
            alert.addAction("다크 모드")
            alert.addAction("둘 다 설정")
            alert.addCancelAction("취소")
            let r = await alert.presentSheet()
            if(r == -1){ throw -1 }
            if(r % 2 == 0){ pid[0] = Object.keys(terrace)[number] }
            if(r){ pid[1] = Object.keys(terrace)[number] }
            refreshPicker()
          }
          
          picker.addRow(row)
        }
        
        let addRow = new UITableRow()
        addRow.dismissOnSelect = false
        
        let addText = addRow.addText("새 배경화면 추가")
        addText.titleColor = Color.blue()
        
        addRow.onSelect = async () => {
          let alert = new Alert()
          alert.title = "이미지 이름 입력"
          alert.message = "지원하는 위젯에서 모든 이미지가 공유됩니다."
          alert.addTextField("", "")
          alert.addAction("확인")
          alert.addCancelAction("취소")
          let r = await alert.presentAlert()
          
          if(r == -1){ throw -1 }
          
          await loadPhoto(alert.textFieldValue())
          refreshPicker()
        }
        
        picker.addRow(addRow)
        
        let removeRow = new UITableRow()
        removeRow.dismissOnSelect = false
        
        let removeText = removeRow.addText("기기 해상도 초기화")
        removeText.titleColor = Color.red()
        
        removeRow.onSelect = async () => {
          let alert = new Alert()
          alert.addDestructiveAction("기기 해상도 초기화")
          alert.addCancelAction("취소")
          let r = await alert.presentSheet()
          if(r != -1){ model.bgResIndex = -1 }
        }
        
        picker.addRow(removeRow)
      }
      
      function refreshPicker(){
        picker.removeAllRows()
        loadPicker()
        picker.reload()
      }
      
      loadPicker()
      await picker.present()
    }
    
    async function getPhoto(){
      let alert = new Alert()
      alert.addAction("사진 앱에서 가져오기")
      alert.addAction("파일 앱에서 가져오기")
      let r = await alert.presentAlert()
      
      let img
      if(r == 0){
        img = await Photos.fromLibrary()
      } else {
        img = await fm.readImage((await DocumentPicker.open(["public.image"]))[0])
      }
      
      let now = new Date().getTime()
      let orgPath = `${fpath.wdir}/${now}.jpg`
      
      await fm.writeImage(orgPath, img)
      pid[0] = now; pid[1] = now;
    }
    
    setPValues()
    
    function loadTable(){
      let bgdesc = ["단색 배경", "이미지 (기기에 맞게 자르기)", "이미지"]
      let bgsub = ["#" + phex, "", ""]
      if(pmode == 2){ bgsub[2] = "눌러서 미리보기" }
      
      for(index in bgdesc){
        let row = new UITableRow()
        row.height = 65
        row.dismissOnSelect = false
        
        let text = row.addText((pmode == parseInt(index) ? "✓ " : "") + bgdesc[index], pmode == index ? bgsub[index] : null)
        text.subtitleColor = Color.gray()
        text.subtitleFont = Font.systemFont(14)
        
        table.addRow(row)
        
        row.onSelect = async (number) => {
          let temp = false
          if(number != 2 && pmode == 2){ temp++ }
          
          if(number == 0){
            let alert = new Alert()
            alert.title = "색상 입력"
            alert.addTextField("Hex Code", "")
            alert.addAction("확인")
            let r = await alert.presentAlert()
            phex = new Color(alert.textFieldValue()).hex
          } else if(number == 1){
            let alert = new Alert()
            alert.title = "기기에 맞는 이미지 설정하기"
            alert.message = "비어 있는 홈 화면에서 스크린샷을 찍은 후, 아래 메뉴에서 해당 이미지를 선택하십시오.\n이 옵션은 일부 iPhone에만 적용됩니다."
            alert.addAction("확인")
            await alert.presentAlert()
          } else if(number == 2){
            if(pmode == 2){
              QuickLook.present(fm.readImage(`${fpath.wdir}/${pid[0]}.jpg`))
              throw -1
            }
            await getPhoto()
          }
          
          if(temp && fm.fileExists(`${fpath.wdir}/${pid[0]}.jpg`)){ fm.remove(`${fpath.wdir}/${pid[0]}.jpg`) }
          pmode = number
          refreshTable()
        }
      }
      
      let option = new UITableRow()
      option.dismissOnSelect = false
      let optionText = option.addText((data[model.id].useSeperateBg ? "✓ " : "") + "구성 " + (mindex + 1) + "에만 배경 적용")
      optionText.titleColor = Color.blue()
      
      option.onSelect = () => {
        savePValues()
        data[model.id].useSeperateBg = 1 - data[model.id].useSeperateBg
        if(data[model.id].bgmode == -1){ savePValues() }
        setPValues()
        refreshTable()
      }
      
      table.addRow(option)
      
      let imgRow = new UITableRow()
      imgRow.dismissOnSelect = false
      
      let imgText = imgRow.addText("이미지 설정")
      imgText.titleColor = Color.blue()
      
      imgRow.onSelect = async () => {
        await showImagePicker()
        refreshTable()
      }
      
      if(pmode == 1){ table.addRow(imgRow) }
    }
    
    function refreshTable(){
      table.removeAllRows()
      loadTable()
      table.reload()
    }
    
    loadTable()
    await table.present()
    
    savePValues()
  }
  
  // ConfigTable
  async function showConfigTable(){
    let table = new UITable()
    table.showSeparators = true
    
    function loadTable(){
      for(index in data.identifiers){
        let row = new UITableRow()
        row.height = 65
        row.dismissOnSelect = false
        
        let text = row.addText((mindex == parseInt(index) ? "✓ " : "") + "구성 " + (parseInt(index) + 1), data[data.identifiers[index]].desc + (data[data.identifiers[index]].devc != "" ? (" – " + data[data.identifiers[index]].devc) : ""))
        text.subtitleColor = Color.gray()
        text.subtitleFont = Font.systemFont(14)
        
        let number = index
        let button = row.addButton("⚙️")
        button.rightAligned()
        
        row.onSelect = () => {
          if(mindex != number){
            model.id = data.identifiers[number]
            saveAllData()
            Safari.open(URLScheme.forRunningScript())
            return 0
          }
        }
        
        button.onTap = async () => {
          let alert = new Alert()
          alert.title = "구성 " + (parseInt(number) + 1)
          if(mindex != number){
            alert.message = "최근 수정: " + rdf.string(new Date(data[data.identifiers[number]].modified), new Date())
          }
          
          alert.addAction("설명 편집")
          alert.addAction("구성 복제")
          alert.addAction("구성 공유")
          if(data.identifiers.length > 1){ alert.addDestructiveAction("선택한 구성 삭제") }
          alert.addCancelAction("취소")
          let r = await alert.presentAlert()
          
          if(r == -1){ throw -1 }
          if(r == 0){
            let alert = new Alert()
            alert.title = "설명 편집"
            alert.addTextField("설명", data[data.identifiers[number]].desc)
            alert.addTextField("제작자", data[data.identifiers[number]].devc)
            alert.addAction("확인")
            alert.addCancelAction("취소")
            let r = await alert.presentAlert()
            if(r != -1){
              data[data.identifiers[number]].desc = alert.textFieldValue(0)
              data[data.identifiers[number]].devc = alert.textFieldValue(1)
              refreshTable()
            }
          } else if(r == 1){
            let now = new Date().getTime()
            const excludes = ["locations", "appleWeather", "openWeather", "covidMohw", "recentPositionRefresh", "recentWeatherRefresh"]
            let temp = JSON.parse(JSON.stringify(data[data.identifiers[number]]))
            for(i in excludes){ delete temp[excludes[i]] }
            data[now] = temp
            data[now].activated = 0
            data.identifiers.push(now)
            model.id = now
            saveAllData()
            Safari.open(URLScheme.forRunningScript())
            return 0
          } else if(r == 2){
            const excludes = ["locations", "appleWeather", "openWeather", "covidMohw", "recentPositionRefresh", "recentWeatherRefresh", "covidRegion", "calendars", "reminders"]
            let temp = JSON.parse(JSON.stringify(data[data.identifiers[number]]))
            for(i in excludes){ delete temp[excludes[i]] }
            QuickLook.present( btoa(JSON.stringify(temp)) )
          } else if(r == 3){
            delete data[data.identifiers[number]]
            data.identifiers.splice(number, 1)
            if(mindex == number){ model.id = data.identifiers[0] }
            saveAllData()
            Safari.open(URLScheme.forRunningScript())
            return 0
          }
          
        }
        
        table.addRow(row)
      }
      
      let addRow = new UITableRow()
      let addText = addRow.addText("새로운 구성 추가..")
      addText.titleColor = Color.blue()
      
      addRow.onSelect = () => {
        model.id = new Date().getTime()
        saveAllData()
        Safari.open(URLScheme.forRunningScript())
        return 0
      }
      
      table.addRow(addRow)
      
      let importRow = new UITableRow()
      importRow.dismissOnSelect = false
      let importText = importRow.addText("다른 구성 가져오기")
      importText.titleColor = Color.blue()
      
      importRow.onSelect = async () => {
        let alert = new Alert()
        alert.title = "외부에서 복사한 데이터 입력"
        alert.message = "API 키 등 일부 정보는 키체인에 저장되어 이 방법으로 불러올 수 없습니다. 위젯 코드를 직접 수정했을 경우 해당 파일을 공유하십시오."
        alert.addTextField("Base64 Encoded string", "")
        alert.addAction("확인")
        alert.addCancelAction("취소")
        let r = await alert.presentAlert()
        
        if(r != -1){
          let targetData = JSON.parse(atob(alert.textFieldValue()))
          
          let alert2 = new Alert()
          alert2.title = targetData.desc ? targetData.desc : "무제"
          alert2.message = `${targetData.devc ? "제작자: " + targetData.devc + "\n" : ""}이 데이터를 기기에 가져올까요?`
          alert2.addAction("확인")
          alert2.addCancelAction("취소")
          let r2 = await alert2.presentAlert()
          if(r2 == -1){ throw -1 }
          
          let now = new Date().getTime()
          data[now] = targetData
          data.identifiers.push(now)
          model.id = now
          saveAllData()
          
          Safari.open(URLScheme.forRunningScript())
          return 0
        }
      }
      
      table.addRow(importRow)
      
      let removeRow = new UITableRow()
      removeRow.dismissOnSelect = false
      
      let removeText = removeRow.addText("데이터 초기화")
      removeText.titleColor = Color.red()
      
      removeRow.onSelect = async () => {
        let alert = new Alert()
        alert.addAction("모든 구성 초기화")
        alert.addAction("다운로드한 이미지 삭제")
        alert.addAction("서비스 캐시 삭제")
        alert.addCancelAction("취소")
        let r = await alert.presentAlert()
        
        if(r == 0){
          let alert2 = new Alert()
          alert2.title = "데이터 초기화"
          alert2.message = "위젯 구성이 모두 삭제되고 기본 구성이 적용됩니다. 이 작업은 되돌릴 수 없습니다."
          alert2.addDestructiveAction("모두 초기화")
          alert2.addCancelAction("취소")
          let r2 = await alert2.presentAlert()
          
          if(r2 != -1){
            fm.remove(fpath.dir)
            Safari.open(URLScheme.forRunningScript())
            return 0
          }
        } else if(r == 1){
          let alert3 = new Alert()
          alert3.title = "모든 이미지 삭제"
          alert3.message = "위젯이 올바르게 작동하지 않는 경우, 이 방법을 사용해 다운로드한 이미지 파일을 모두 제거하십시오. 이 작업은 되돌릴 수 없습니다."
          alert3.addDestructiveAction("모두 제거")
          alert3.addCancelAction("취소")
          let r3 = await alert3.presentAlert()
          
          if(r3 != -1){
            fm.remove(fpath.adir)
            fm.remove(fpath.wall)
            Safari.open(URLScheme.forRunningScript())
            return 0
          }
        } else if(r == 2){
          const excludes = ["locations", "appleWeather", "openWeather", "covidMohw"]
          for(i in excludes){ delete data[model.id][excludes[i]] }
          data[model.id].recentPositionRefresh = 0
          data[model.id].recentWeatherRefresh = 0
          data[model.id].covidCache = 0
        }
      }
      
      table.addRow(removeRow)
    }
    
    function refreshTable(){
      table.removeAllRows()
      loadTable()
      table.reload()
    }
    
    loadTable()
    await table.present()
  }
  
  // PosTable
  async function showPosTable(){
    let table = new UITable()
    table.showSeparators = true
    
    eval(editorElements)
    
    function loadTable(){
      let sizes = ["소형 위젯", "중형 위젯", "대형 위젯"]
      let positions = [["좌측 상단", "우측 상단", "좌측 중단", "우측 중단", "좌측 하단", "우측 하단"], ["상단", "중단", "하단"], ["상단", "하단"]]
      
      for(let i = 1; i < sizes.length; i++){
        addPropertyHeader(sizes[i])
        
        for(let j = 0; j < positions[i].length; j++){
          let index = i == 1 ? j + 7 : j + 10
          let row = new UITableRow()
          row.dismissOnSelect = false
          
          let text = row.addText((index == data[model.id].pos ? "✓ " : "") + positions[i][j])
          
          row.onSelect = (number) => {
            data[model.id].pos = number < 4 ? number + 6 : number + 5
            refreshTable()
          }
          
          table.addRow(row)
        }
      }
    }
    
    function refreshTable(){
      table.removeAllRows()
      loadTable()
      table.reload()
    }
    
    loadTable()
    await table.present()
  }
  
  // LayoutTable
  async function showLayoutTable(){
    let table = new UITable()
    table.showSeparators = true
    
    eval(editorElements)
    
    const elements = {
      "text": "텍스트",
      "text2": "텍스트",
      "date": "날짜",

      // "tags": "태그",
      
      // "quickMemo": "빠른 메모",
      // "dayCounter": "디데이",
      
      "calendar": "캘린더",
      "reminder": "미리 알림",
      
      // "calendarMini": "다음 일정",
      
      "appleWeather": "Apple 날씨",
      // "appleWeatherMini": "Apple 날씨(요약)",
      
      // "openWeather": "OpenWeather 날씨",
      // "openWeatherMini": "OpenWeather 날씨(요약)",
      
      "covid": "코로나19 정보",
      
      "spacer": "상하 여백(최대)",
      "spacer2": "상하 여백(최대)",
      
      "spacer5": "상하 여백(지정)",
      "spacer6": "상하 여백(지정)",
      "spacer7": "상하 여백(지정)",
    }
    
    async function showElementPicker(){
      let picker = new UITable()
      picker.showSeparators = true
      
      function loadPicker(){
        let availableElements = []
        // Elements update
        for(let i = 0; i < data[model.id].layout.length; i++){
          if(Object.keys(elements).indexOf(data[model.id].layout[i]) == -1){
            data[model.id].layout.splice(i, 1)
          }
        }
        
        for(let i = 0; i < Object.keys(elements).length; i++){
          if(data[model.id].layout.indexOf(Object.keys(elements)[i]) == -1){
            availableElements.push(Object.keys(elements)[i])
          }
        }
        
        for(let i = 0; i < data[model.id].layout.length; i++){
          let subtitle = null
          if(data[model.id].layout[i] == "spacer5"){
            subtitle = "크기: " + data[model.id].spacer5
          } else if(data[model.id].layout[i] == "spacer6"){
            subtitle = "크기: " + data[model.id].spacer6
          } else if(data[model.id].layout[i] == "spacer7"){
            subtitle = "크기: " + data[model.id].spacer7
          } else if(data[model.id].layout[i] == "text"){
            subtitle = data[model.id].textString
          } else if(data[model.id].layout[i] == "text2"){
            subtitle = data[model.id].textString2
          }
          
          let row = new UITableRow()
          row.dismissOnSelect = false
          
          let text = row.addText("✓ " + elements[data[model.id].layout[i]], subtitle)
          text.widthWeight = 55
          
          if(subtitle != null){
            text.subtitleColor = Color.gray()
            text.subtitleFont = Font.systemFont(12)
            row.height = 60
          }
          
          let k = i + 0
          
          let upButton = row.addButton("⬆️")
          upButton.widthWeight = 15
          
          upButton.onTap = () => {
            if(k != 0){
              data[model.id].layout.splice(k-1, 0, data[model.id].layout[k])
              data[model.id].layout.splice(k+1, 1)
            }
            refreshPicker()
          }
          
          let downButton = row.addButton("⬇️")
          downButton.widthWeight = 15
          
          downButton.onTap = () => {
            if(k != data[model.id].layout.length - 1){
              data[model.id].layout.splice(k+2, 0, data[model.id].layout[k])
              data[model.id].layout.splice(k, 1)
            }
            refreshPicker()
          }
          
          let removeButton = row.addButton("✖")
          removeButton.widthWeight = 15
          
          removeButton.onTap = () => {
            data[model.id].layout.splice(k, 1)
            refreshPicker()
          }
          
          picker.addRow(row)
        }
        
        for(let i = 0; i < availableElements.length; i++){
          let row = new UITableRow()
          row.dismissOnSelect = false
          
          let text = row.addText(elements[availableElements[i]])
          
          row.onSelect = async (number) => {
            let j = number - data[model.id].layout.length
            if(availableElements[j] == "text"){
              let alert = new Alert()
              alert.title = "표시할 텍스트 입력"
              alert.addTextField("", "")
              alert.addAction("확인")
              alert.addCancelAction("취소")
              
              let r = await alert.presentAlert()
              if(r == -1 || alert.textFieldValue() === ""){ throw -1 }
              data[model.id].textString = alert.textFieldValue()
            } else if(availableElements[j] == "text2"){
              let alert = new Alert()
              alert.title = "표시할 텍스트 입력"
              alert.addTextField("", "")
              alert.addAction("확인")
              alert.addCancelAction("취소")
              
              let r = await alert.presentAlert()
              if(r == -1 || alert.textFieldValue() === ""){ throw -1 }
              data[model.id].textString2 = alert.textFieldValue()
            } else if(availableElements[j] == "spacer5" || availableElements[j] == "spacer6" || availableElements[j] == "spacer7"){
              let alert = new Alert()
              alert.title = "상하 여백 상대 값"
              let i = alert.addTextField("", "")
              i.setDecimalPadKeyboard()
              alert.addAction("확인")
              alert.addCancelAction("취소")
              
              let r = await alert.presentAlert()
              if(r == -1 || alert.textFieldValue() === ""){ throw -1 }
              data[model.id][availableElements[j]] = parseFloat(alert.textFieldValue())
            } else if(availableElements[j] == "appleWeather"){
              if(!Keychain.contains("blend-appleweather-auth") && !Keychain.contains("blend-appleweather")){
                let alert = new Alert()
                alert.title = "구성 요소를 추가할 수 없음"
                alert.message = "인증 정보를 확인할 수 없습니다."
                alert.addAction("지금 입력하기")
                alert.addCancelAction("취소")
                
                let r = await alert.presentAlert()
                if(r == 0){ await showAuthTable() }
                
                throw -1
              }
            } else if(availableElements[j] == "openWeather"){
              if(!Keychain.contains("blend-openweather")){
                let alert = new Alert()
                alert.title = "구성 요소를 추가할 수 없음"
                alert.message = "인증 정보를 확인할 수 없습니다."
                alert.addAction("지금 입력하기")
                alert.addCancelAction("취소")
                
                let r = await alert.presentAlert()
                if(r == 0){ await showAuthTable() }
                
                throw -1
              }
            }
            
            data[model.id].layout.push(availableElements[j])
            refreshPicker()
          }
          
          picker.addRow(row)
        }
      }
      
      function refreshPicker(){
        picker.removeAllRows()
        loadPicker()
        picker.reload()
      }
      
      loadPicker()
      await picker.present()
    }
    
    function loadTable(){
      let elementRow = new UITableRow()
      elementRow.dismissOnSelect = false
      
      let elementText = elementRow.addText("구성 요소")
      elementText.titleColor = Color.blue()
      
      elementRow.onSelect = async () => {
        await showElementPicker()
        refreshTable()
      }
      
      table.addRow(elementRow)
      
      addPropertyHeader("위젯 전역 설정")
      
      let paddingRow = new UITableRow()
      paddingRow.height = 65
      paddingRow.dismissOnSelect = false
      
      let paddingText = paddingRow.addText("레이아웃 여백", data[model.id].widgetPadding.toString())
      paddingText.subtitleColor = Color.gray()
      paddingText.subtitleFont = Font.systemFont(14)
      
      paddingRow.onSelect = async () => {
        let alert = new Alert()
        alert.title = "레이아웃 여백"
        alert.message = "상단, 좌측, 하단, 우측"
        alert.addTextField("", data[model.id].widgetPadding.toString())
        alert.addAction("확인")
        alert.addCancelAction("취소")
        let r = await alert.presentAlert()
        
        if(r != -1){
          data[model.id].widgetPadding = alert.textFieldValue().split(',', 4)
          for(let i = 0; i < 4; i++){
            if(isNaN(data[model.id].widgetPadding[i])){
              data[model.id].widgetPadding[i] = 0
            } else {
              data[model.id].widgetPadding[i] = parseFloat(data[model.id].widgetPadding[i])
            }
          }
        }
        
        refreshTable()
      }
      
      table.addRow(paddingRow)
      
      let textColorRow = new UITableRow()
      textColorRow.height = 65
      textColorRow.dismissOnSelect = false
      
      let textColorText = textColorRow.addText("기본 텍스트 색상", "#" + data[model.id].textColor[0] + ", #" + data[model.id].textColor[1])
      textColorText.subtitleColor = Color.gray()
      textColorText.subtitleFont = Font.systemFont(14)
      
      textColorRow.onSelect = async () => {
        let alert = new Alert()
        alert.title = "기본 텍스트 색상"
        alert.addTextField("라이트 모드 - Color Hex", data[model.id].textColor[0])
        alert.addTextField("다크 모드 - Color Hex", data[model.id].textColor[1])
        alert.addAction("확인")
        alert.addCancelAction("취소")
        
        let r = await alert.presentAlert()
        
        if(r != -1){
          let lightColor = new Color(alert.textFieldValue(0)).hex
          let darkColor = new Color(alert.textFieldValue(1)).hex
          
          data[model.id].textColor[0] = lightColor
          data[model.id].textColor[1] = darkColor
          
          refreshTable()
        }
      }
      
      table.addRow(textColorRow)
      
      let textSizeRow = new UITableRow()
      textSizeRow.height = 65
      textSizeRow.dismissOnSelect = false
      
      let textSizeText = textSizeRow.addText("기본 텍스트 크기", data[model.id].textSize.toString())
      textSizeText.subtitleColor = Color.gray()
      textSizeText.subtitleFont = Font.systemFont(14)
      
      textSizeRow.onSelect = async () => {
        let alert = new Alert()
        alert.title = "기본 텍스트 크기"
        alert.message = "텍스트 크기는 구성 요소의 중요도에 따라 3단계로 나뉩니다. 일부 텍스트의 경우 기본 텍스트 크기를 무시할 수 있습니다. 이 경우 소스 코드에서 직접 수정하여야 합니다."
        let sizes = ["가장 큰 크기", "큰 크기", "보통 크기"]
        for(i in sizes){
          let input = alert.addTextField(sizes[i], data[model.id].textSize[i].toString())
          input.setDecimalPadKeyboard()
        }
        alert.addAction("확인")
        alert.addCancelAction("취소")
        
        let r = await alert.presentAlert()
        if(r != -1){
          for(i in sizes){
            data[model.id].textSize[i] = (isNaN(alert.textFieldValue(i)) || alert.textFieldValue(i) === "") ? data.origin.textSize[i] : parseFloat(alert.textFieldValue(i))
          }
        }
        
        refreshTable()
      }
      
      table.addRow(textSizeRow)
      
      addTextFieldElements("기본 아이콘 크기", "iconSize", 
        "SF Symbol 아이콘에 적용됩니다.",
        "", "")
      
      let displayMode = ["주로 밝게", "주로 어둡게"]
      addMultipleIndexElements("스택 배경 스타일", "displayMode", displayMode)

      addTextFieldElements("스택 배경 투명도", "stackOpacity", 
        "일부 구성 요소에 배경이 포함되어 있을 경우, 투명도를 조정할 수 있습니다.",
        "", "")
      
      let itmAlignment = ["좌측에 배치", "중앙에 배치", "우측에 배치"]
      addMultipleIndexElements("구성 요소 정렬", "itmAlignment", itmAlignment)
      
      addTextFieldElements("좌우 여백 오프셋", "itmSpacerOffset", 
        "구성 요소가 좌측 또는 우측에 배치되어 있을 경우, 추가적인 여백에 대한 오프셋을 지정할 수 있습니다.",
        "", "")
      
      addTextFieldElements("상하 반복 여백 오프셋", "itmRepeatOffset", 
        "각각의 구성 요소 사이에 상하 여백을 설정할 수 있습니다.",
        "", "")
      
      if(data[model.id].layout.indexOf("date") != -1){
        addPropertyHeader("날짜")
        addTextProperty("오늘 날짜", "dateText")
        addTickerElements("배터리 보기", "showBattery")
      }
      
      if(data[model.id].layout.indexOf("text") != -1){
        addPropertyHeader("텍스트: " + data[model.id].textString)
        addTextProperty("텍스트", "simpleText")
      }
      
      if(data[model.id].layout.indexOf("text2") != -1){
        addPropertyHeader("텍스트: " + data[model.id].textString2)
        addTextProperty("텍스트", "simpleText2")
      }
      
      if(data[model.id].layout.indexOf("quickMemo") != -1){
        addPropertyHeader("빠른 메모")
        addTextProperty("텍스트", "quickMemoText")
      }
      
      if(data[model.id].layout.indexOf("calendar") != -1){
        addPropertyHeader("캘린더")
        addTextProperty("\"다가오는 이벤트 없음\"", "noEventText")
        addTextProperty("날짜 표시", "dateMarker")
        addTextProperty("이벤트 제목", "eventTitle")
        addTextProperty("이벤트 시작 시간 및 내용", "eventDuration")
      }
      
      if(data[model.id].layout.indexOf("reminder") != -1){
        addPropertyHeader("미리 알림")
        addTextProperty("미리 알림 제목", "reminderTitle")
        addTextProperty("미리 알림 내용", "reminderDate")
      }
      
      if(data[model.id].layout.indexOf("appleWeather") != -1){
        addPropertyHeader("Apple 날씨")
        addTextProperty("일출과 일몰 시간", "awSolarText")
        addTextProperty("기상 정보 텍스트", "awDetailText")
      }
      
      if(data[model.id].layout.indexOf("covid") != -1){
        addPropertyHeader("코로나19 정보")
        addTextProperty("제목 및 내용", "covidTitle")
      }
      
      function addTextProperty(message, code){
        let row = new UITableRow()
        row.height = 65
        row.dismissOnSelect = false
        
        let string
        let currentFont = data[model.id]["_" + code][0]
        if(currentFont){ string = fontsDesc[currentFont] }
        else { string = data[model.id]["_" + code][1] ? data[model.id]["_" + code][1] : "커스텀 폰트" }
        
        let text = row.addText(message, string + ", " + data[model.id]["_" + code][2])
        text.subtitleColor = Color.gray()
        text.subtitleFont = Font.systemFont(14)
        
        row.onSelect = async () => {
          let picker = new UITable()
          picker.showSeparators = true
          
          function loadPicker(){
            for(let i = 0; i < fonts.length; i++){
              let row = new UITableRow()
              row.dismissOnSelect = true
              
              let string
              if(i){ string = fontsDesc[i] }
              else { string = data[model.id]["_" + code][1] ? data[model.id]["_" + code][1] : "커스텀 폰트" }
              
              let text = row.addText((data[model.id]["_" + code][0] == i ? "✓ " : "") + string)
              if(data[model.id]["_" + code][0] == i){ text.titleColor = Color.blue() }
              
              row.onSelect = async (number) => {
                let alert = new Alert()
                alert.title = fonts[number]
                let i = alert.addTextField("폰트 크기", data[model.id]["_" + code][2].toString())
                i.setDecimalPadKeyboard()
                if(!number){ alert.addTextField(data[model.id]["_" + code][1], data[model.id]["_" + code][1]) }
                alert.addAction("확인"); alert.addCancelAction("취소");
                let r = await alert.presentAlert()
                if(r == -1){ throw -1 }
                data[model.id]["_" + code][0] = number
                if(!number){ data[model.id]["_" + code][1] = alert.textFieldValue(1) }
                data[model.id]["_" + code][2] = alert.textFieldValue(0) === "" ? data.origin["_" + code][2] : parseFloat(alert.textFieldValue(0))
                // refreshPicker()
                refreshTable()
              }
              
              picker.addRow(row)
            }
            
            let resetRow = new UITableRow()
            
            let resetText = resetRow.addText("초기 설정으로 복원")
            resetText.titleColor = Color.red()
            
            resetRow.onSelect = () => {
              data[model.id]["_" + code] = data.origin["_" + code]
              refreshTable()
            }
            
            picker.addRow(resetRow)
          }
          
          function refreshPicker(){
            picker.removeAllRows()
            loadPicker()
            picker.reload()
          }
          
          loadPicker()
          await picker.present()
        }
        
        table.addRow(row)
      }
    }
    
    function refreshTable(){
      table.removeAllRows()
      loadTable()
      table.reload()
    }
    
    loadTable()
    await table.present()
  }
  
  // EventTable
  async function showEventTable(){
    let table = new UITable()
    table.showSeparators = true
    
    eval(editorElements)
    
    async function showCalendarPicker(){
      let picker = new UITable()
      picker.showSeparators = true
      
      let calendars = await Calendar.forEvents()
      
      function loadPicker(){
        for(let i = 0; i < calendars.length; i++){
          let row = new UITableRow()
          row.dismissOnSelect = false
          
          let text = row.addText((data[model.id].calendars.indexOf(calendars[i].identifier) != -1 ? "✓ " : "") + calendars[i].title)
          
          row.onSelect = (number) => {
            let j = data[model.id].calendars.indexOf(calendars[number].identifier)
            if(j != -1){
              data[model.id].calendars.splice(j, 1)
            } else {
              data[model.id].calendars.push(calendars[number].identifier)
            }
            
            refreshPicker()
          }
          
          picker.addRow(row)
        }
      }
      
      function refreshPicker(){
        picker.removeAllRows()
        loadPicker()
        picker.reload()
      }
      
      loadPicker()
      await picker.present()
    }
    
    async function showReminderPicker(){
      let picker = new UITable()
      picker.showSeparators = true
      
      let calendars = await Calendar.forReminders()
      
      function loadPicker(){
        for(let i = 0; i < calendars.length; i++){
          let row = new UITableRow()
          row.dismissOnSelect = false
          
          let text = row.addText((data[model.id].reminders.indexOf(calendars[i].identifier) != -1 ? "✓ " : "") + calendars[i].title)
          
          row.onSelect = (number) => {
            let j = data[model.id].reminders.indexOf(calendars[number].identifier)
            if(j != -1){
              data[model.id].reminders.splice(j, 1)
            } else {
              data[model.id].reminders.push(calendars[number].identifier)
            }
            
            refreshPicker()
          }
          
          picker.addRow(row)
        }
      }
      
      function refreshPicker(){
        picker.removeAllRows()
        loadPicker()
        picker.reload()
      }
      
      loadPicker()
      await picker.present()
    }
    
    function loadTable(){
      addPropertyHeader("캘린더")
      
      let pickerRow = new UITableRow()
      pickerRow.dismissOnSelect = false
      pickerRow.height = 65
      
      let calCnt = data[model.id].calendars.length
      
      let pickerText = pickerRow.addText("위젯에 표시할 캘린더", calCnt ? `${calCnt}개 선택됨` : "모든 캘린더 표시")
      pickerText.subtitleColor = Color.gray()
      pickerText.subtitleFont = Font.systemFont(14)
      
      table.addRow(pickerRow)
      
      pickerRow.onSelect = async () => {
        await showCalendarPicker()
        refreshTable()
      }
      
      addTextFieldElements("표시할 이벤트 개수", "calendarLength",
        "위젯에 최대로 표시할 수 있는 이벤트의 개수를 설정합니다.", "예정된 ", "개의 이벤트 표시")
      
      addTickerElements("달력 보기", "setCalendarView")
      addTickerElements("2열 레이아웃 적용", "calendarTwoRow")
      
      addPropertyHeader("이벤트 표시 범위", true)
      
      addTickerElements("하루 종일 이벤트 표시", "showAllDayEvents")
      
      addTextFieldElements("이벤트 표시 범위", "distanceEventStartDate", 
        "이벤트를 가져올 범위를 지정합니다.",
        "", "일 후의 이벤트까지 표시")
      
      addPropertyHeader("세부 설정", true)
      
      addTextFieldElements("지나간 이벤트 숨기기", "delayHideEventsMin", 
        "이미 시작된 이벤트를 위젯에서 숨깁니다.", "시작 시간이 ", "분 이상 지난 이벤트")
      
      addMultipleChoiceElements("이벤트 세부 사항 표시", "eventDurationMethod", 
        "이벤트 항목의 시간 및 위치를 표시하는 방식을 설정할 수 있습니다.",
        ["시작 시간과 기간", "시작 시간과 종료 시간", "시작 시간과 위치"], false, 
        ["시작 시간과 기간", "시작 시간과 종료 시간", "시작 시간과 위치"])
      
      let imageRow = new UITableRow()
      imageRow.dismissOnSelect = false
      
      let imageText = imageRow.addText("배경 이미지 설정")
      imageText.titleColor = Color.blue()
      
      // table.addRow(imageRow)
      
      imageRow.onSelect = () => {
        
      }
      
      addPropertyHeader("미리 알림")
      
      let pickerRow2 = new UITableRow()
      pickerRow2.dismissOnSelect = false
      pickerRow2.height = 65
      
      let remCnt = data[model.id].reminders.length
      
      let pickerText2 = pickerRow2.addText("위젯에 표시할 미리 알림 목록", remCnt ? `${remCnt}개 선택됨` : "모든 미리 알림 표시")
      pickerText2.subtitleColor = Color.gray()
      pickerText2.subtitleFont = Font.systemFont(14)
      
      table.addRow(pickerRow2)
      
      pickerRow2.onSelect = async () => {
        await showReminderPicker()
        refreshTable()
      }
      
      addTextFieldElements("표시할 미리 알림 개수", "reminderLength",
        "위젯에 최대로 표시할 수 있는 미리 알림의 개수를 설정합니다.", "예정된 ", "개의 미리 알림 표시")
      
      addPropertyHeader("미리 알림 표시 범위", true)
      
      addTickerElements("예정 시간이 있는 미리 알림만 표시", "showForTimedReminders")
      if(data[model.id].showForTimedReminders){
        addTickerElements("오늘 진행되는 미리 알림만 표시", "showTodayReminders")
      }
      
      addPropertyHeader("세부 설정", true)
      
      addTickerElements("늦은 미리 알림도 표시", "showLateReminders")
      
      addTickerElements("시작 시간 순으로 정렬", "sortReminderByTime")
    }
    
    function refreshTable(){
      table.removeAllRows()
      loadTable()
      table.reload()
    }
    
    loadTable()
    await table.present()
  }
  
  // WeatherTable
  async function showWeatherTable(){
    let table = new UITable()
    table.showSeparators = true
    
    eval(editorElements)
    
    function loadTable(){
      addTextFieldElements("위치 정보 새로고침 간격", "delayPositionCacheMin", 
        "위치 정보를 다시 가져오기 위해 필요한 최소 간격을 지정합니다.", "", "분")
      addTextFieldElements("날씨 정보 새로고침 간격", "delayWeatherCacheMin", 
        "날씨 정보를 다시 가져오기 위해 필요한 최소 간격을 지정합니다.", "", "분")
      
      addTickerElements("화씨 온도 사용", "weatherCtoF")
      
      if(data[model.id].layout.indexOf("appleWeather") != -1){
        addTickerElements("날씨 상태 한국어로 사용", "weatherAlternativeDesc")

        addPropertyHeader("Apple 날씨")
        addTickerElements("현재 온도", "apwdTemp")
        addTickerElements("기상 정보", "apwdDetail")
        addTickerElements("당일 시간별 예보", "apwdHourly")
        addTickerElements("일간 예보", "apwdDaily")
        
        addPropertyHeader("현재 온도", true)
        addTickerElements("일출과 일몰 시간", "apwdSolarMovement")
        
        addPropertyHeader("기상 정보", true)
        addTickerElements("기압", "apwdPressure")
        addTickerElements("습도", "apwdHumidity")
        addTickerElements("체감 온도", "apwdApparentTemp")
        addTickerElements("강수량", "apwdPrecip")
        addTickerElements("바람 속도", "apwdWindSpeed")
        addTickerElements("자외선 지수", "apwdUvIndex")
      }
    }
    
    function refreshTable(){
      table.removeAllRows()
      loadTable()
      table.reload()
    }
    
    loadTable()
    await table.present()
  }
  
  // CovidTable
  async function showCovidTable(){
    const regionsArr = ['서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종', '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주', '검역']
    
    let table = new UITable()
    table.showSeparators = true
    
    eval(editorElements)
    
    function loadTable(){
      let row = new UITableRow()
      row.dismissOnSelect = false
      row.height = 65
      
      let text = row.addText("코로나19 수신 지역", regionsArr[data[model.id].covidRegion - 1])
      text.subtitleColor = Color.gray()
      text.subtitleFont = Font.systemFont(14)
      
      row.onSelect = async () => {
        let picker = new UITable()
        picker.showSeparators = true
        
        function loadPicker(){
          for(let i = 0; i < regionsArr.length; i++){
            let row = new UITableRow()
            row.dismissOnSelect = false
            
            let text = row.addText((data[model.id].covidRegion == i + 1 ? "✓ " : "") + regionsArr[i])
            
            row.onSelect = (j) => {
              data[model.id].covidRegion = j + 1
              data[model.id].covidCache = 0
              refreshPicker()
            }
            
            picker.addRow(row)
          }
        }
        
        function refreshPicker(){
          picker.removeAllRows()
          loadPicker()
          picker.reload()
        }
        
        loadPicker()
        await picker.present()
        
        refreshTable()
      }
      
      table.addRow(row)

      addTickerElements("자세한 내용 보기", "covidShowDetail")
    }
    
    function refreshTable(){
      table.removeAllRows()
      loadTable()
      table.reload()
    }
    
    loadTable()
    await table.present()
  }
  
  // MiscTable
  async function showMiscTable(){
    let table = new UITable()
    table.showSeparators = true

    let df = new DateFormatter()
    df.dateFormat = "yyyy년 M월 d일"
    df.locale = "ko-kr"
    
    eval(editorElements)
    
    function loadTable(){
      let hStackRow = new UITableRow()
      hStackRow.height = 65
      hStackRow.dismissOnSelect = false
      
      let hStackText = hStackRow.addText("레이아웃 가로 크기", `${model.stackWidth}`)
      hStackText.subtitleColor = Color.gray()
      hStackText.subtitleFont = Font.systemFont(14)
      
      hStackRow.onSelect = async () => {
        let alert = new Alert()
        alert.title = "레이아웃 가로 크기"
        alert.message = "기기에 따라 이 값을 조정할 수 있습니다. 해당 옵션은 모든 구성에서 공유됩니다."
        let i = alert.addTextField("", model.stackWidth.toString())
        i.setDecimalPadKeyboard()
        alert.addAction("확인")
        alert.addCancelAction("취소")
        let r = await alert.presentAlert()
        
        if(r != -1){
          let n = parseFloat(alert.textFieldValue())
          if(!isNaN(n) && n > 0){ model.stackWidth = n }
          refreshTable()
        }
      }
      
      table.addRow(hStackRow)
      
      addTextFieldElements("날짜 포맷", "dateFormat", 
        "", "", "")
      addTextFieldElements("시간 포맷", "timeFormat", 
        "", "", "")
      addTextFieldElements("표시 로케일", "locale", 
        "날짜 및 시간 포맷에 적용됩니다.", "", "")

      let widgetNameRow = new UITableRow()
      widgetNameRow.height = 65
      widgetNameRow.dismissOnSelect = false
      
      let widgetNameText = widgetNameRow.addText("위젯 스크립트 이름", `${model.widgetScriptName}`)
      widgetNameText.subtitleColor = Color.gray()
      widgetNameText.subtitleFont = Font.systemFont(14)
      
      widgetNameRow.onSelect = async () => {
        let alert = new Alert()
        alert.title = "위젯 스크립트 이름"
        alert.addTextField("blend-widget", model.widgetScriptName)
        alert.addAction("확인")
        alert.addCancelAction("취소")

        let r = await alert.presentAlert()
        
        if(r != -1){
          model.widgetScriptName = alert.textFieldValue()
          refreshTable()
        }
      }

      table.addRow(widgetNameRow)
      
      let checkRow = new UITableRow()
      checkRow.height = 65
      
      let checkText = checkRow.addText("온라인 컨텐츠 새로고침", "최근 확인: " + df.string(new Date(model.updateCache)))
      checkText.subtitleColor = Color.gray()
      checkText.subtitleFont = Font.systemFont(14)
      
      checkRow.onSelect = () => {
        model.updateCache = -1
        model.service = -1
        
        saveAllData()
        Safari.open(URLScheme.forRunningScript())
        return 0
      }
      
      table.addRow(checkRow)
      
      addPropertyHeader("개발자")
      
      let devRow = new UITableRow()
      devRow.dismissOnSelect = false
      
      let devText = devRow.addText((model.id == model.devid ? "✓ " : "") + "위젯에 강제 로드")
      
      devRow.onSelect = () => {
        if(model.id == model.devid){ model.devid = -1 }
        else { model.devid = model.id }
        refreshTable()
      }
      
      table.addRow(devRow)
      
      addTickerElements("모든 서비스 강제 로드", "forceLoadService")
      
      let borderRow = new UITableRow()
      borderRow.dismissOnSelect = false
      
      let borderText = borderRow.addText((model.showBorder ? "✓ " : "") + "Stack 테두리 표시")
      
      borderRow.onSelect = () => {
        model.showBorder = 1 - model.showBorder
        refreshTable()
      }
      
      table.addRow(borderRow)
      
      let devRow2 = new UITableRow()
      devRow2.dismissOnSelect = false
      
      let devText2 = devRow2.addText("구성 Raw 데이터 보기")
      devText2.titleColor = Color.blue()
      
      devRow2.onSelect = () => {
        QuickLook.present(data[model.id])
      }
      
      table.addRow(devRow2)
    }
    
    function refreshTable(){
      table.removeAllRows()
      loadTable()
      table.reload()
    }
    
    loadTable()
    await table.present()
  }

  // HelpTable
  async function showHelpTable(){
    let table = new UITable()
    table.showSeparators = true

    let df = new DateFormatter()
    df.dateFormat = "yyyy년 M월 d일"
    df.locale = "ko-kr"
    
    eval(editorElements)
    
    function loadTable(){
      if(model.service != null){
        if(model.service.announcement != undefined){
          if(model.service.announcement.length){
            for(let i = 0; i < model.service.announcement.length; i++){
              let row = new UITableRow()
              row.height = 65
              row.dismissOnSelect = false

              let text = row.addText(model.service.announcement[i].title, "추가됨: " + df.string(new Date(model.service.announcement[i].startDate)))
              text.subtitleColor = Color.gray()
              text.subtitleFont = Font.systemFont(14)

              table.addRow(row)

              row.onSelect = () => {
                Safari.openInApp(model.service.announcement[i].link, false)
              }
            }
          }
        }
      }

      let helpRow1 = new UITableRow()
      helpRow1.dismissOnSelect = false
      
      let helpText1 = helpRow1.addText("Blend 관련 문서")
      helpText1.titleColor = Color.blue()
      
      helpRow1.onSelect = () => {
        Safari.open("https://blend.oopy.io/install")
      }
      
      table.addRow(helpRow1)

      let helpRow2 = new UITableRow()
      helpRow2.dismissOnSelect = false
      
      let helpText2 = helpRow2.addText("공식 디스코드에 참여하기")
      helpText2.titleColor = Color.blue()
      
      helpRow2.onSelect = () => {
        Safari.open("https://discord.gg/BCP2S7BdaC")
      }
      
      table.addRow(helpRow2)
    }

    function refreshTable(){
      table.removeAllRows()
      loadTable()
      table.reload()
    }
    
    loadTable()
    await table.present()
  }
}

const editorElements = `
    function addMultipleIndexElements(title, code, list){
      let row = new UITableRow()
      row.height = 65
      row.dismissOnSelect = false
      
      let text = row.addText(title, list[data[model.id][code]])
      text.subtitleColor = Color.gray()
      text.subtitleFont = Font.systemFont(14)
      
      row.onSelect = async () => {
        let alert = new Alert()
        for(i in list){
          alert.addAction((data[model.id][code] == i ? "✓ " : "") + list[i])
        }
        alert.addCancelAction("취소")
        let r = await alert.presentSheet()
        if(r == -1){ throw -1 }
        data[model.id][code] = r
        refreshTable()
      }
      
      table.addRow(row)
    }
    
    function addPropertyHeader(title, applySubtitleColor){
      let header = new UITableRow()
      header.height = 40
      
      let headerText = header.addText(title)
      headerText.titleFont = Font.boldSystemFont(14)
      headerText.titleColor = applySubtitleColor ? Color.orange() : Color.purple()
      
      table.addRow(header)
    }
    
    function addTickerElements(title, code){
      let row = new UITableRow()
      row.dismissOnSelect = false
      
      let text = row.addText((data[model.id][code] ? "✓ " : "") + title)
      
      row.onSelect = () => {
        data[model.id][code] = 1 - data[model.id][code]
        refreshTable()
      }
      
      table.addRow(row)
    }
    
    function addTextFieldElements(title, code, message, suffix, prefix){
      let row = new UITableRow()
      row.dismissOnSelect = false
      row.height = 65
      
      let text = row.addText(title, (suffix ? suffix : "") + data[model.id][code].toString() + (prefix ? prefix : ""))
      text.subtitleColor = Color.gray()
      text.subtitleFont = Font.systemFont(14)
      
      row.onSelect = async () => {
        let isValueNumber = !(isNaN(data.origin[code]) || data.origin[code] === "")
        let alert = new Alert()
        alert.title = title
        alert.message = message
        let input = alert.addTextField("", data[model.id][code].toString())
        if(isValueNumber){ input.setDecimalPadKeyboard() }
        alert.addAction("확인")
        alert.addCancelAction("취소")
        let r = await alert.presentAlert()
        if(r != -1){
          data[model.id][code] = alert.textFieldValue()
          if(isValueNumber){ data[model.id][code] = parseFloat(data[model.id][code]) }
        }
        
        refreshTable()
      }
      
      table.addRow(row)
    }
    
    function addMultipleChoiceElements(title, code, message, option = [], cancelable, subtitles = []){
      let row = new UITableRow()
      row.dismissOnSelect = false
      row.height = 65
      
      let text = row.addText(title, subtitles[data[model.id][code]])
      text.subtitleColor = Color.gray()
      text.subtitleFont = Font.systemFont(14)
      
      row.onSelect = async () => {
        let alert = new Alert()
        alert.title = title
        alert.message = message
        for(i in option){ alert.addAction(option[i]) }
        if(cancelable){ alert.addCancelAction("취소") }
        let r = await alert.presentAlert()
        if(r == -1){ throw -1 }
        data[model.id][code] = r
        
        refreshTable()
      }
      
      table.addRow(row)
    }
`

const phoneSizes = {
  "2778": {
    "models": ["13 Pro Max", "12 Pro Max"],
    "small": { "w": 510, "h": 510 },
    "medium": { "w": 1092, "h": 510 },
    "large": { "w": 1092, "h": 1146 },
    "left": 96,
    "right": 678,
    "top": 246,
    "middle": 882,
    "bottom": 1518
  },

  "2532": {
    "models": ["13 Pro", "13", "12 Pro", "12"],
    "small": { "w": 474, "h": 474 },
    "medium": { "w": 1014, "h": 474 },
    "large": { "w": 1014, "h": 1062 },
    "left": 78,
    "right": 618,
    "top": 231,
    "middle": 819,
    "bottom": 1407
  },

  "2688": {
    "models": ["11 Pro Max", "Xs Max"],
    "small": { "w": 507, "h": 507 },
    "medium": { "w": 1080, "h": 507 },
    "large": { "w": 1080, "h": 1137 },
    "left": 81,
    "right": 654,
    "top": 228,
    "middle": 858,
    "bottom": 1488
  },

  "1792": {
    "models": ["11", "Xr"],
    "small": { "w": 338, "h": 338 },
    "medium": { "w": 720, "h": 338 },
    "large": { "w": 720, "h": 758 },
    "left": 54,
    "right": 436,
    "top": 160,
    "middle": 580,
    "bottom": 1000
  },

  "2436": [{
    "models": ["11 Pro", "Xs", "X"],
    "small": { "w": 465, "h": 465 },
    "medium": { "w": 987, "h": 465 },
    "large": { "w": 987, "h": 1035 },
    "left": 69,
    "right": 591,
    "top": 213,
    "middle": 783,
    "bottom": 1353
  },
  {
    "models": ["13 Mini", "12 Mini"],
    "small": { "w": 465, "h": 465 },
    "medium": { "w": 987, "h": 465 },
    "large": { "w": 987, "h": 1035 },
    "left": 69,
    "right": 591,
    "top": 231,
    "middle": 801,
    "bottom": 1371
  }],

  "2208": {
    "models": ["6+", "6s+", "7+", "8+"],
    "small": { "w": 471, "h": 471 },
    "medium": { "w": 1044, "h": 471 },
    "large": { "w": 1044, "h": 1071 },
    "left": 99,
    "right": 672,
    "top": 114,
    "middle": 696,
    "bottom": 1278
  },

  "1334": {
    "models": ["6", "6s", "7", "8"],
    "small": { "w": 296, "h": 296 },
    "medium": { "w": 642, "h": 296 },
    "large": { "w": 642, "h": 648 },
    "left": 54,
    "right": 400,
    "top": 60,
    "middle": 412,
    "bottom": 764
  },

  "1136": {
    "models": ["5", "5s", "5c", "SE"],
    "small": { "w": 282, "h": 282 },
    "medium": { "w": 584, "h": 282 },
    "large": { "w": 584, "h": 622 },
    "left": 30,
    "right": 332,
    "top": 59,
    "middle": 399,
    "bottom": 399
  },
  
  "1624": {
    "models": ["11 Display Zoom mode", "XR Display Zoom mode"],
    "small": { "w": 310, "h": 310 },
    "medium": { "w": 658, "h": 310 },
    "large": { "w": 658, "h": 690 },
    "left": 46,
    "right": 394,
    "top": 142,
    "middle": 522,
    "bottom": 902
  },
  
  "2001": {
    "models": ["Plus Display Zoom mode"],
    "small": { "w": 444, "h": 444 },
    "medium": { "w": 963, "h": 444 },
    "large": { "w": 963, "h": 972 },
    "left": 81,
    "right": 600,
    "top": 90,
    "middle": 618,
    "bottom": 1146
  }
}

function saveAllData(){
  fm.writeString(fpath.data, JSON.stringify(data))
  fm.writeString(fpath.model, JSON.stringify(model))
//   console.log(`저장 완료: ${new Date()}`)
}

if(config.runsInApp){
  await showLauncher()
  saveAllData()
  fm.writeString(fpath.wall, JSON.stringify(terrace))
}
