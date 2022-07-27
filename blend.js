// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: moon;
const version = "1.0"
let dt = new Date().getTime()

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
  
  "bgtemp": -1, // 2436_mini
  
  "mver": "1.1",
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
  
  "calendars": [],
  "reminders": [],
  
  "calendarTwoRow": 0,
  "calendarLength": 3,
  "reminderLength": 3,
  "showAllDayEvents": 0,
  "showTodayEvents": 1,
  "distanceEventStartDate": 1,
  "delayHideEventsMin": 5,
  "eventDurationMethod": 0,
  "showLateReminders": 0,
  "showForTimedReminders": 0,
  "showTodayReminders": 0,
  
  "locations": {},
  "appleWeather": {},
  "openWeather": {},
  
  "delayPositionCacheMin": 10,
  "delayWeatherCacheMin": 10,
  
  "recentPositionRefresh": 0,
  "recentWeatherRefresh": 0,
  
  "covidRegion": "S. Korea",
  
  "widgetPadding": [0, 0, 0, 0],
  "layout": [],
  
  "textColor": ["FFFFFF", "FFFFFF"],
  "textSize": [16, 13, 12],
  "textOpacity": 1,
  
  "dateFormat": "M월 d일 E요일",
  "timeFormat": "a h:mm",
  "locale": "ko-kr",
  
  "textString": "",
  
  // TextProperty
  // fontIndex, customFontName, fontSize
  "_simpleText": [1, "", 0],
  
  "_dateText": [1, "", 0],
  
  "_noEventText": [1, "", 12],
  "_dateMarker": [1, "", 10],
  "_eventTitle": [1, "", 12],
  "_eventDuration": [1, "", 12],
  
  "_reminderTitle": [1, "", 12],
}

const fonts = ["custom", "boldSystem", "boldMonospaced", "boldRounded", "mediumSystem", "mediumMonospaced", "mediumRounded", "lightSystem", "lightMonospaced", "lightRounded"]

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

// setup end



let rdf = new RelativeDateTimeFormatter()
rdf.locale = "ko-kr"; rdf.useNumericDateTimeStyle();

// 투명 배경

function cropImage(img, rect) {
  let draw = new DrawContext()
  draw.size = new Size(rect.w, rect.h)
  draw.drawImageAtPoint(img, new Point(-rect.x, -rect.y))
  return draw.getImage()
}

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

  "2436": {
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
  
  "2436_mini": {
    "models": ["12 Mini"],
    "small": { "w": 465, "h": 465 },
    "medium": { "w": 987, "h": 465 },
    "large": { "w": 987, "h": 1035 },
    "left": 69,
    "right": 591,
    "top": 231,
    "middle": 801,
    "bottom": 1371
  },

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



async function showLauncher(){
  let main = new UITable()
  main.showSeparators = true
  
  function loadMain(){
    let titleRow = new UITableRow()
    titleRow.height = 120
    
    let title = titleRow.addText("Blend", `버전 ${version}`)
    title.widthWeight = 46
    title.titleFont = Font.boldSystemFont(24)
    title.subtitleFont = Font.systemFont(14)
    
    let authBt = titleRow.addButton("보안")
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
    
    let installText = installRow.addText((new Date().getTime() - data[model.id].activated < 1800000 ? "✓ " : "") + "홈 화면에 " + "구성 " + (mindex + 1) + " 추가")
    installText.titleColor = Color.blue()
    
    installRow.onSelect = async () => {
      let alert = new Alert()
      alert.title = "구성 " + (mindex + 1) + " 추가"
      alert.message = `Scriptable 위젯을 길게 누른 후 "위젯 편집", "Parameter"에 아래 값을 입력하십시오.`
      alert.addTextField("", model.id.toString())
      alert.addAction("확인")
      
      await alert.presentAlert()
    }
    
    main.addRow(installRow)
    
    let previewRow = new UITableRow()
    let previewText = previewRow.addText("위젯 미리보기")
    previewText.titleColor = Color.blue()
    
    previewRow.onSelect = () => {
      Safari.open(`scriptable:///run?scriptName=blend-widget&wid=${model.id}`)
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
    // addRowElement("코로나19 정보", "Covid")
    addRowElement("일반 설정", "Misc")
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
    
    let layout = {
      "apwk": ["Apple WeatherKit", "유효한 JWT 방식의 토큰을 입력하십시오. 자세한 내용은 다음 링크를 참조하십시오: https://developer.apple.com/documentation/weatherkitrestapi/request_authentication_for_weatherkit_rest_api"],
      "opwd": ["OpenWeather", "API 키를 입력하십시오."],
    
    }
    
    function loadTable(){
      for(index in layout){
        let key = (btoa("BLENDSECURE"+index.toUpperCase()))
        
        let row = new UITableRow()
        row.dismissOnSelect = false
        
        let text = row.addText((Keychain.contains(key) ? "✓ " : "") + layout[index][0])
        
        row.onSelect = async (number) => {
          number = Object.keys(layout)[number]
          
          let alert = new Alert()
          alert.title = layout[number][0]
          alert.message = layout[number][1]
          alert.addTextField("여기에 붙여넣기", "")
          alert.addAction("확인")
          await alert.presentAlert()
          
          if(alert.textFieldValue() == ""){
            throw -1
          }
          
          let key = (btoa("BLENDSECURE"+number.toUpperCase()))
          await Keychain.set(key, alert.textFieldValue())
          
          let alert2 = new Alert()
          alert2.title = "저장 완료"
          alert2.addAction("확인")
          await alert2.presentAlert()
          
          refreshTable()
        }
        
        table.addRow(row)
      }
      
      let removeRow = new UITableRow()
      let removeText = removeRow.addText("모든 키체인 정보 삭제")
      removeText.titleColor = Color.red()
      
      removeRow.onSelect = async () => {
        for(index in layout){
          let key = (btoa("BLENDSECURE"+index.toUpperCase()))
          if(Keychain.contains(key)){ await Keychain.remove(key) }
        }
        
        let alert = new Alert()
        alert.title = "삭제 완료"
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
      if(phone.length > 1){ phone = phone[model.bgtemp] }
      
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
        } else if(height == 2436 && model.bgtemp == -1){
          let alert = new Alert()
          alert.addAction("11 Pro, Xs, X")
          alert.addAction("12 Mini, 13 Mini")
          model.bgtemp = await alert.presentAlert()
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
          
          let button = row.addButton("편집")
          button.rightAligned()
          
          let temp = parseInt(index).toString()
          
          button.onTap = async () => {
            let alert = new Alert()
            alert.title = terrace[temp].desc
            alert.message = "적용 기기: " + phoneSizes[terrace[temp].height].models[0] + "와 같은 해상도"
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
            let r = await alert.presentSheet()
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
        
        row.onSelect = async (number) => {
          let alert = new Alert()
          alert.title = "구성 " + (parseInt(number) + 1)
          if(mindex != number){
            alert.message = "최근 수정: " + rdf.string(new Date(data[data.identifiers[number]].modified), new Date())
            alert.addAction("이 구성으로 변경")
          } else {
            alert.message = "현재 적용된 구성입니다."
          }
          
          alert.addAction("설명 편집..")
          alert.addAction("구성 복제")
          alert.addAction("구성 공유")
          if(data.identifiers.length > 1){ alert.addDestructiveAction("선택한 구성 삭제") }
          alert.addCancelAction("취소")
          let r = await alert.presentAlert()
          
          if(r == -1){ throw -1 }
          if(mindex == number){ r++ }
          if(r == 0){
            model.id = data.identifiers[number]
            saveAllData()
            Safari.open(URLScheme.forRunningScript())
            return 0
          } else if(r == 1){
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
          } else if(r == 2){
            let now = new Date().getTime()
            data[now] = JSON.parse(JSON.stringify(data[data.identifiers[number]]))
            data[now].activated = 0
            data.identifiers.push(now)
            model.id = now
            saveAllData()
            Safari.open(URLScheme.forRunningScript())
            return 0
          } else if(r == 3){
            let temp = JSON.parse(JSON.stringify(data[data.identifiers[number]]))
            delete temp.locations;
            delete temp.appleWeather; delete temp.openWeather;
            delete temp.calendars; delete temp.reminders;
            QuickLook.present( btoa(JSON.stringify(temp)) )
          } else if(r == 4){
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
    
    function loadTable(){
      let sizes = ["소형 위젯", "중형 위젯", "대형 위젯"]
      let positions = [["좌측 상단", "우측 상단", "좌측 중단", "우측 중단", "좌측 하단", "우측 하단"], ["상단", "중단", "하단"], ["상단", "하단"]]
      
      for(let i = 1; i < sizes.length; i++){
        let header = new UITableRow()
        header.height = 40
        
        let headerText = header.addText(sizes[i])
        headerText.titleFont = Font.boldSystemFont(14)
        
        table.addRow(header)
        
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
      "date": "날짜",
      
      "calendar": "캘린더",
      "reminder": "미리 알림",
      
      // "appleWeather": "Apple 날씨",
      // "openWeather": "OpenWeather 날씨",
      
      // "covid": "코로나19 정보",
      
      "spacer": "상하 여백",
      "spacer2": "상하 여백",
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
          let row = new UITableRow()
          row.dismissOnSelect = false
          
          let text = row.addText("✓ " + elements[data[model.id].layout[i]])
          text.widthWeight = 55
          
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
      
      let elementRow = new UITableRow()
      elementRow.dismissOnSelect = false
      
      let elementText = elementRow.addText("구성 요소")
      elementText.titleColor = Color.blue()
      
      elementRow.onSelect = async () => {
        await showElementPicker()
        refreshTable()
      }
      
      table.addRow(elementRow)
      
      if(data[model.id].layout.indexOf("date") != -1){
        addPropertyHeader("날짜")
        addTextProperty("오늘 날짜", "dateText")
      }
      
      if(data[model.id].layout.indexOf("text") != -1){
        addPropertyHeader("텍스트")
        addTextProperty("텍스트", "simpleText")
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
      }
      
      function addTextProperty(message, code){
        let row = new UITableRow()
        row.height = 65
        row.dismissOnSelect = false
        
        let text = row.addText(message, fonts[data[model.id]["_" + code][0]] + ", " + data[model.id]["_" + code][2])
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
              
              let text = row.addText((data[model.id]["_" + code][0] == i ? "✓ " : "") + (i || data[model.id]["_" + code][1] === "" ? fonts[i] : data[model.id]["_" + code][1]))
              
              row.onSelect = async (number) => {
                let alert = new Alert()
                alert.title = fonts[number]
                let i = alert.addTextField("폰트 크기", data[model.id]["_" + code][2].toString())
                i.setDecimalPadKeyboard()
                if(!number){ alert.addTextField(data[model.id]["_" + code][1] === "" ? "커스텀 폰트 이름" : data[model.id]["_" + code][1], "") }
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
          }
          
          function refreshPicker(){
            picker.removeAllRows()
            loadPicker()
            picker.reload()
          }
          
          loadPicker()
          await picker.present()
          
          // refreshTable()
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
      
      let pickerText = pickerRow.addText("위젯에 표시할 캘린더", `${data[model.id].calendars.length}개 선택됨`)
      pickerText.subtitleColor = Color.gray()
      pickerText.subtitleFont = Font.systemFont(14)
      
      table.addRow(pickerRow)
      
      pickerRow.onSelect = async () => {
        await showCalendarPicker()
        refreshTable()
      }
      
      addTextFieldElements("표시할 이벤트 개수", "calendarLength",
        "위젯에 최대로 표시할 수 있는 이벤트의 개수를 설정합니다.", "예정된 ", "개의 이벤트 표시")
      
      addTickerElements("캘린더 2열로 표시", "calendarTwoRow")
      
      addTickerElements("하루 종일 이벤트 표시", "showAllDayEvents")
      addTickerElements("오늘 진행되는 이벤트만 표시", "showTodayEvents")
      if(!data[model.id].showTodayEvents){
        addTextFieldElements("이벤트 표시 범위", "distanceEventStartDate", 
          "이벤트를 가져올 범위를 지정합니다. 소수점은 시간 단위로 변환하여 적용됩니다.",
          "시작 시간이 ", "일 이내인 이벤트")
      }
      
      addTextFieldElements("지나간 이벤트 숨기기", "delayHideEventsMin", 
        "이미 시작된 이벤트를 위젯에서 숨깁니다.", "시작 시간이 ", "분 이상 지난 이벤트")
      
      addMultipleChoiceElements("이벤트 세부 사항 표시", "eventDurationMethod", 
        "이벤트 항목의 시간 및 위치를 표시하는 방식을 설정할 수 있습니다.",
        ["시작 시간과 기간", "시작 시간과 종료 시간", "시작 시간과 위치"], false, 
        ["시작 시간과 기간", "시작 시간과 종료 시간", "시작 시간과 위치"])
      
      addPropertyHeader("미리 알림")
      
      let pickerRow2 = new UITableRow()
      pickerRow2.dismissOnSelect = false
      pickerRow2.height = 65
      
      let pickerText2 = pickerRow2.addText("위젯에 표시할 미리 알림 목록", `${data[model.id].reminders.length}개 선택됨`)
      pickerText2.subtitleColor = Color.gray()
      pickerText2.subtitleFont = Font.systemFont(14)
      
      table.addRow(pickerRow2)
      
      pickerRow2.onSelect = async () => {
        await showReminderPicker()
        refreshTable()
      }
      
      addTextFieldElements("표시할 미리 알림 개수", "reminderLength",
        "위젯에 최대로 표시할 수 있는 미리 알림의 개수를 설정합니다.", "예정된 ", "개의 미리 알림 표시")
      
      addTickerElements("늦은 미리 알림도 표시", "showLateReminders")
      addTickerElements("예정 시간이 있는 미리 알림만 표시", "showForTimedReminders")
      
      if(data[model.id].showForTimedReminders){
        addTickerElements("오늘 진행되는 미리 알림만 표시", "showTodayReminders")
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
    let table = new UITable()
    table.showSeparators = true
    
    eval(editorElements)
    
    function loadTable(){
      addTextFieldElements("코로나19 수신 국가", "covidRegion", 
        "", "", "")
      
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
    
    eval(editorElements)
    
    function loadTable(){
      addTextFieldElements("날짜 포맷", "dateFormat", 
        "", "", "")
      addTextFieldElements("시간 포맷", "timeFormat", 
        "", "", "")
      addTextFieldElements("표시 로케일", "locale", 
        "날짜 및 시간 포맷에 적용됩니다.", "", "")
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
    function addPropertyHeader(title){
      let header = new UITableRow()
      header.height = 40
      
      let headerText = header.addText(title)
      headerText.titleFont = Font.boldSystemFont(14)
      
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

function getSymbolImage(code, imageSize){
  let sfs = SFSymbol.named(code)
  sfs.applyFont(Font.systemFont(imageSize))
  return sfs.image
}


