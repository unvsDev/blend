// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-purple; icon-glyph: moon;
const version = "1.4.1"
let dtDate = new Date()
let dt = dtDate.getTime()

let dtInitial = new Date(dtDate.getTime()).setHours(0,0,0,0)


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

function getSymbolImage(code, imageSize){
  let sfs = SFSymbol.named(code)
  sfs.applyFont(Font.systemFont(imageSize))
  return sfs.image
}

async function checkFileAvailability(filePath){
  if(fm.isFileStoredIniCloud(filePath) && !fm.isFileDownloaded(filePath)){
    try {
      await fm.downloadFileFromiCloud(filePath)
    } catch(e){
      throw new Error("누락된 파일 다운로드 실패. 네트워크 환경을 확인해주세요.")
    }
  }
}


// QuickMemo
/*
if(args.queryParameters.openService == "quickMemo"){
  let alert = new Alert()
  alert.title = "bingo!"
  alert.addAction("Yes")
  await alert.presentAlert()
  return 0
}
*/

// Initial setup
let forceRefreshService = false
let wid = -1
let ignoreSizeLimit = false

let model = JSON.parse(fm.readString(fpath.model))
if(model.devid != -1){ wid = model.devid }

if(config.runsInWidget){
  if(config.widgetFamily == "small" && !ignoreSizeLimit){
    throw new Error("지원하지 않는 위젯 크기")
  }
  if(!args.widgetParameter){
    let widget = new ListWidget()
    widget.backgroundColor = Color.black()
    
    let symbol = widget.addImage(getSymbolImage("icloud.and.arrow.down", 26))
    symbol.imageSize = new Size(26,26)
    symbol.tintColor = Color.white()
    symbol.centerAlignImage()
    
    widget.addSpacer(5)
    
    let text = widget.addText("위젯 길게 누르기 → 위젯 편집 → Parameter → 값 입력")
    text.font = Font.boldSystemFont(16)
    text.textColor = Color.white()
    text.centerAlignText()
    
    widget.addSpacer(5)
    
    let text2 = widget.addText("Blend 런처 → 홈 화면에 구성 추가 → 값 복사")
    text2.font = Font.systemFont(12)
    text2.textColor = Color.blue()
    text2.centerAlignText()
    
    Script.setWidget(widget)
    return 0
  }
  wid = args.widgetParameter
} else if(config.runsInApp){
  if(args.queryParameters.wid == undefined){
    if(wid == -1){ return 0 }
  } else { wid = args.queryParameters.wid }
}

// Load data
let dataAll = JSON.parse(fm.readString(fpath.data))
let data
try{
  data = JSON.parse(JSON.stringify(dataAll[wid]))
} catch(e){
  throw new Error("유효하지 않은 Parameter 값")
}
let terrace = JSON.parse(fm.readString(fpath.wall))

forceRefreshService = data.forceLoadService

// Date and Time formatting
let df = new DateFormatter()
df.dateFormat = data.dateFormat
df.locale = data.locale

let dfShorten = new DateFormatter()
dfShorten.dateFormat = "M월 d일 (E)"
dfShorten.locale = "ko-kr"

let dfTime = new DateFormatter()
dfTime.dateFormat = data.timeFormat
dfTime.locale = data.locale

let rdf = new RelativeDateTimeFormatter()
rdf.useNamedDateTimeStyle()
rdf.locale = data.locale

function getiOSCalendarScheme(number){
  let time = Math.floor(number / 1000)
  let seconds = time - 978307200 // Since Jan 1, 2001
  return "calshow:" + seconds.toString()
}

// textProperty
let primaryTextColor = Color.dynamic(new Color(data.textColor[0]), new Color(data.textColor[1]))
let primaryIconSize = new Size(data.iconSize, data.iconSize)

let primaryStackColor = data.displayMode ? new Color("000000", data.stackOpacity) : new Color("ffffff", data.stackOpacity)

function setTextProperty(code, object){
  if(data["_" + code] == undefined){
    object.font = Font.systemFont(12)
    return 0
  }
  
  let textSize = data["_" + code][2]
  switch(data["_" + code][0]){
    case 0:
      object.font = new Font(data["_" + code][1], textSize); break;
    case 1:
      object.font = Font.boldSystemFont(textSize); break;
    case 2:
      object.font = Font.boldMonospacedSystemFont(textSize); break;
    case 3:
      object.font = Font.boldRoundedSystemFont(textSize); break;
    case 4:
      object.font = Font.mediumSystemFont(textSize); break;
    case 5:
      object.font = Font.mediumMonospacedSystemFont(textSize); break;
    case 6:
      object.font = Font.mediumRoundedSystemFont(textSize); break;
    case 7:
      object.font = Font.lightSystemFont(textSize); break;
    case 8:
      object.font = Font.lightMonospacedSystemFont(textSize); break;
    case 9:
      object.font = Font.lightRoundedSystemFont(textSize); break;
  }
}

let locations
let apwkData
let covidData

async function loadPosition(){
  try{
    if(!forceRefreshService && dt - data.recentPositionRefresh < 1000 * 60 * data.delayPositionCacheMin){ throw -1 }
    
    Location.setAccuracyToHundredMeters()
    locations = await Location.current()
    
    data.locations = locations
    data.recentPositionRefresh = dt
  } catch(e){
    if(!data.locations.latitude){
      throw new Error("위치 정보를 찾을 수 없음")
    }
    locations = data.locations
  }
}

async function loadAppleWeather(){
  try{
    if(!forceRefreshService && dt - data.recentWeatherRefresh < 1000 * 60 * data.delayWeatherCacheMin){ throw -1 }
    
    let token
    if(Keychain.contains("blend-appleweather-auth")){
      let auth = await new Request(Keychain.get("blend-appleweather-auth")).loadJSON()
      token = auth.token
    } else {
      token = Keychain.get("blend-appleweather")
    }
    
    let request = new Request(`https://weatherkit.apple.com/api/v1/weather/en/${locations.latitude}/${locations.longitude}?countryCode=KR&timezone=Asia/Seoul&dataSets=currentWeather,forecastDaily,forecastHourly&hourlyStart=${dtDate.toISOString()}`)
    request.headers = {
      'Authorization': 'Bearer ' + token
    }
    
    apwkData = await request.loadJSON()
    if(!apwkData.currentWeather){ throw -1 }
    
    data.appleWeather = apwkData
    data.recentWeatherRefresh = dt
  } catch(e){
    if(!data.appleWeather.currentWeather){
      throw new Error("Apple 날씨: 정보를 찾을 수 없음")
    }
    apwkData = data.appleWeather
  }
}

async function loadCovidData(){
  try{
    if(!forceRefreshService && dtDate.getHours() === data.covidCache){ throw -1 }
      
    let source = "http://ncov.mohw.go.kr/bdBoardList_Real.do?brdId=1&brdGubun=13&ncvContSeq=&contSeq=&board_id=&gubun="
    let webView = new WebView()
    await webView.loadURL(source)
    
    let regionCode = data.covidRegion + 1
    covidData = await webView.evaluateJavaScript(`
      const regionRow = ${regionCode}
      const baseSelector = 'div.container div.content div.data_table.midd.mgt24 '
      
      // 전국 확진자 증감, 전국 확진자 총합, 전국 사망자 총합, 지역 이름, 지역 확진자 증감, 지역 확진자 총합, 데이터 기준
      let data = {
        "totalPrev": stoi(document.querySelector(baseSelector + 'table.num.midsize tbody tr:nth-child(1) td.number:nth-child(2)').innerText),
        "totalConfirmed": stoi(document.querySelector(baseSelector + 'table.num.midsize tbody tr:nth-child(1) td.number:nth-child(5)').innerText),
        "totalDeceased": stoi(document.querySelector(baseSelector + 'table.num.midsize tbody tr:nth-child(1) td.number:nth-child(6)').innerText),
        
        "regName": document.querySelector(baseSelector + 'table.num.midsize tbody tr:nth-child(' + regionRow + ') th').innerText,
        "regPrev": stoi(document.querySelector(baseSelector + 'table.num.midsize tbody tr:nth-child(' + regionRow + ') td.number:nth-child(2)').innerText),
        "regConfirmed": stoi(document.querySelector(baseSelector + 'table.num.midsize tbody tr:nth-child(' + regionRow + ') td.number:nth-child(5)').innerText),
        
        "reportedTime": document.querySelector('div.wrap.nj div.container div.content div.timetable p.info span').innerText + "시 기준",
      }
      
      completion(data)
      
      function stoi(stringNumber){
        return parseInt(stringNumber.replace(/,/g , ''));
      }
    `, true)
    
    data.covidCache = dtDate.getHours()
    data.covidMohw = covidData
  } catch(e){
    if(!data.covidMohw.totalPrev){
      throw new Error("코로나19 정보: 정보를 찾을 수 없음")
    }
    covidData = data.covidMohw
  }
}

// Load AsyncFunctions
if(data.layout.includes("appleWeather") || data.layout.includes("openWeather")){
  await loadPosition()
  
  if(data.layout.includes("appleWeather")){
    await loadAppleWeather()
  }
  
  if(data.layout.includes("openWeather")){
  // await loadOpenWeather()
  }
}

if(data.layout.includes("covid")){
  await loadCovidData()
}



// Main code
let widget = new ListWidget()

let wrapper = widget.addStack()
wrapper.size = new Size(model.stackWidth, 0)
wrapper.layoutVertically()

if(model.showBorder){
  wrapper.borderWidth = 1
  wrapper.borderColor = Color.blue()
}

// Layout Part
for(let i = 0; i < data.layout.length; i++){
  
  if(data.layout[i] == "spacer" || data.layout[i] == "spacer2"){
    // VerticalSpacer
    wrapper.addSpacer()
    
  } else if(data.layout[i] == "spacer5"){
    wrapper.addSpacer(data.spacer5)
  
  } else if(data.layout[i] == "spacer6"){
    wrapper.addSpacer(data.spacer6)
  
  } else if(data.layout[i] == "spacer7"){
    wrapper.addSpacer(data.spacer7)
  
  } else if(data.layout[i] == "text" && data.textString){
    // TextView
    let textView = wrapper.addStack()
    textView.centerAlignContent()

    if(model.showBorder){
      textView.borderWidth = 2
      textView.borderColor = Color.red()
    }
    
    if(data.itmAlignment > 0){ textView.addSpacer() }
    else if(data.itmSpacerOffset){ textView.addSpacer(data.itmSpacerOffset) }

    let simpleText = textView.addText(data.textString)
    simpleText.textColor = primaryTextColor
    setTextProperty("simpleText", simpleText)
    simpleText.textOpacity = 0.8

    if(data.itmAlignment < 2){ textView.addSpacer() }
    else if(data.itmSpacerOffset){ textView.addSpacer(data.itmSpacerOffset) }
    
  } else if(data.layout[i] == "text2" && data.textString2){
    // TextView
    let textView = wrapper.addStack()
    textView.centerAlignContent()

    if(model.showBorder){
      textView.borderWidth = 2
      textView.borderColor = Color.red()
    }
    
    if(data.itmAlignment > 0){ textView.addSpacer() }
    else if(data.itmSpacerOffset){ textView.addSpacer(data.itmSpacerOffset) }

    let simpleText = textView.addText(data.textString2)
    simpleText.textColor = primaryTextColor
    setTextProperty("simpleText2", simpleText)
    simpleText.textOpacity = 0.8

    if(data.itmAlignment < 2){ textView.addSpacer() }
    else if(data.itmSpacerOffset){ textView.addSpacer(data.itmSpacerOffset) }
  
  } else if(data.layout[i] == "date"){
    // DateView
    const battery = Math.floor(Device.batteryLevel() * 100)

    let dateView = wrapper.addStack()
    dateView.centerAlignContent()

    if(model.showBorder){
      dateView.borderWidth = 2
      dateView.borderColor = Color.red()
    }
    
    if(data.itmAlignment > 0){ dateView.addSpacer() }
    else if(data.itmSpacerOffset){ dateView.addSpacer(data.itmSpacerOffset) }

    let dateIcon = dateView.addImage(getSymbolImage("calendar", 32))
    dateIcon.tintColor = primaryTextColor
    dateIcon.imageSize = primaryIconSize
    dateIcon.imageOpacity = 0.8
    
    dateView.addSpacer(3)

    let dateText = dateView.addText(df.string(dtDate))
    dateText.textColor = primaryTextColor
    setTextProperty("dateText", dateText)
    dateText.textOpacity = 0.8

    if(data.showBattery){
      dateView.addSpacer(6)

      let batteryIcon = dateView.addImage(getSymbolImage("battery.100", 32))
      batteryIcon.tintColor = primaryTextColor
      batteryIcon.imageSize = primaryIconSize
      batteryIcon.imageOpacity = 0.8

      dateView.addSpacer(3)

      let batteryText = dateView.addText(battery + "% " + (Device.isCharging() ? "충전 중" : "배터리"))
      batteryText.textColor = primaryTextColor
      setTextProperty("dateText", batteryText)
      batteryText.textOpacity = 0.8
    }

    if(data.itmAlignment < 2){ dateView.addSpacer() }
    else if(data.itmSpacerOffset){ dateView.addSpacer(data.itmSpacerOffset) }
  
  } else if(data.layout[i] == "quickMemo"){
    // QuickMemo
    
    let text = wrapper.addText("Go")
    text.url = `scriptable:///run?scriptName=${model.widgetScriptName}&openService=quickMemo`
    
  
  } else if(data.layout[i] == "calendarMini"){
    // SingleEventView
    let singleEventView = wrapper.addStack()
    singleEventView.size = new Size(0, 30)
    singleEventView.cornerRadius = 6
    
    singleEventView.backgroundColor = primaryStackColor
    
    
    
    singleEventView.addSpacer()
  
  } else if(data.layout[i] == "calendar"){
    
    // SimpleCalendarView
    async function setSimpleCalendar(date, target){
      let dt = new Date(date.getFullYear(), date.getMonth(), 1);
      let last = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      let events = await CalendarEvent.between(dt, last, [])
      
      let eventArray = new Array(32)
      for(let i=0; i<eventArray.length; i++){
        eventArray[i] = 0
      }
      
      for(event in events){
        let obj = events[event]
        eventArray[ new Date(obj.startDate).getDate() ]++
      }
      
      Date.prototype.addDays = function(days) {
        var date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;
      }
      
      let varr = new Array([], [], [], [], [], [], [])
      
      let char = ["일", "월", "화", "수", "목", "금", "토"]
      
      for(let i=0; i<7; i++){
        varr[i][0] = char[i]
      }
      
      let firstRow = dt.getDay()
      let maxRow = 2
      let startMo = dt.getMonth()
      
      while(dt.getMonth() == startMo){
        let prev = dt.getDay()
        let len = varr[dt.getDay()].length
        varr[dt.getDay()][len] = dt.getDate()
        
        dt = dt.addDays(1)
        if(dt.getMonth() == startMo && dt.getDay() < prev){ maxRow++ }
      }
      
      for(let i = 0; i<firstRow; i++){
        varr[i].splice(1, 0, " ")
      }
      
      for(let i=0; i<7; i++){
        if(varr[i].length < maxRow){
          varr[i].splice(varr[i].length, 0, " ")
        }
      }
      
      let stack = target.addStack()
      
      let hstack = stack.addStack()
      hstack.layoutHorizontally()
      
      for(let i=0; i<7; i++){
        let vstack = hstack.addStack()
        vstack.layoutVertically()
        vstack.size = new Size(16,0)
        
        let middle = vstack.addStack()
        middle.size = new Size(16,0)
        
        let marker = middle.addText(varr[i][0])
        marker.textColor = primaryTextColor
        marker.font = Font.systemFont(10)
        
        if(varr[i][0] == char[0]){ // Sunday
          marker.textOpacity = 0.5
        } else if(varr[i][0] == char[6]){ // Saturday
          marker.textOpacity = 0.5
        }
        
        vstack.addSpacer(5)
        
        for(let j=1; j<varr[i].length; j++){
          let middle = vstack.addStack()
          middle.size = new Size(16,0)
          
          let string = middle.addText(varr[i][j].toString())
          string.textColor = new Color("000000")
          string.font = Font.semiboldMonospacedSystemFont(10)
          string.textColor = primaryTextColor

          let stringDate = new Date(date.getFullYear(), date.getMonth(), varr[i][j])
          string.url = getiOSCalendarScheme(stringDate.getTime())
          
          if(varr[i][0] == char[0]){
            string.textOpacity = 0.5
          } else if(varr[i][0] == char[6]){
            string.textOpacity = 0.5
          }
          
          if(varr[i][j] == date.getDate()){
            middle.cornerRadius = 5
            middle.backgroundColor = Color.purple()
            
            string.textColor = new Color("ffffff")
            string.textOpacity = 1
          } else if(typeof(varr[i][j]) == "number" && eventArray[varr[i][j]]){
            middle.cornerRadius = 5
            middle.backgroundColor = new Color("ffffff", 0.8)
            string.textColor = new Color("000000")
            string.textOpacity = 1.0
          }
          
          if(j!=varr[i].length-1){ vstack.addSpacer(6) }
        }
        
        if(i!=6){ hstack.addSpacer(2) }
      }
    }
    
    // CalendarView
    if(data.setCalendarView){ data.calendarTwoRow = 1 }
    
    let startDate = dtInitial
    let endDate = new Date(startDate + 1000 * 60 * 60 * 24 * data.distanceEventStartDate).setHours(24,0,0,0)
    let oneWeekAfter = new Date(startDate + 1000 * 60 * 60 * 24 * 7).setHours(0,0,0,0)
    
    let calendars = (await Calendar.forEvents()).filter(i => data.calendars.indexOf(i.identifier) != -1)
    let calendarEvents = await CalendarEvent.between(new Date(startDate), new Date(endDate), calendars)
    calendarEvents = calendarEvents.filter(i => i.isAllDay || (dt - new Date(i.startDate).getTime() < 1000 * 60 * data.delayHideEventsMin))
    
    if(!data.showAllDayEvents){ calendarEvents = calendarEvents.filter(i => !i.isAllDay) }
    
    let calendarView = wrapper.addStack()
    calendarView.layoutVertically()

    if(model.showBorder){
      calendarView.borderWidth = 2
      calendarView.borderColor = Color.green()
    }
    
    let vSpacer = calendarView.addStack()
    vSpacer.addSpacer()
    
    // CalendarTwoRow
    let outerStack = calendarView.addStack()
    
    let calendarLeft = outerStack.addStack()
    calendarLeft.layoutVertically()
    
    outerStack.addSpacer(3)
    
    let calendarRight = outerStack.addStack()
    calendarRight.layoutVertically()
    
    if(data.calendarTwoRow){
      let spacerLeft = calendarLeft.addStack()
      spacerLeft.addSpacer()
      
      let spacerRight = calendarRight.addStack()
      spacerRight.addSpacer()
    }
    
    // SimpleCalendar
    if(data.setCalendarView){
      let tmp = new Date(dtInitial)
      
      let calendarWrapper = calendarRight.addStack()
      calendarWrapper.addSpacer()
      await setSimpleCalendar(tmp, calendarWrapper)
    }

    let mid = Math.ceil(data.calendarLength / 2)
    let minimumEvents = Math.min(calendarEvents.length, data.calendarLength)

    let target = calendarLeft

    if(!calendarEvents.length){
      let noEventText = target.addText("다가오는 이벤트 없음")
      noEventText.textColor = primaryTextColor
      setTextProperty("noEventText", noEventText)
      noEventText.url = "calshow://"
    }
    
    for(let j = 0; j < minimumEvents; j++){
      if(data.setCalendarView){ target = calendarLeft }
      else if(data.calendarTwoRow){ target = j >= mid ? calendarRight : calendarLeft }
      else { target = calendarView }

      let isSpacerAvailable = (j != mid || data.setCalendarView) && data.calendarTwoRow
      
      let startDate = new Date(calendarEvents[j].startDate)
      let endDate = new Date(calendarEvents[j].endDate)
      
      let startDateText = `${dfTime.string(startDate)}`
      
      let duration = (endDate.getTime() - startDate.getTime()) / 1000 / 60 // [min]
      let durationText = ""
      
      if(!calendarEvents[j].isAllDay){
        if(duration >= 60 * 24){
          durationText = `${Math.floor(duration / 1440)}일 `
          duration = duration - Math.floor(duration / 1440) * 1440
        }
        if(duration >= 60){
          durationText = durationText + (durationText ? " " : "") + `${Math.floor(duration / 60)}시간`
          duration = duration - Math.floor(duration / 60) * 60
        }
        if(duration > 0){
          durationText = durationText + (durationText ? " " : "") + `${duration}분`
        }
      }
      
      let endDateText = startDate.getDate() == endDate.getDate() ? `${dfTime.string(endDate)}` : `${dfShorten.string(endDate)} ${dfTime.string(endDate)}`
      
      let isLocationFetched = calendarEvents[j].location != null
      let isMultiDayEvent = startDate.setHours(0,0,0,0) != endDate.setHours(0,0,0,0)
      
      let eventDetailText
      if(calendarEvents[j].isAllDay){
        if(isMultiDayEvent){
          let dfTemp = new DateFormatter()
          dfTemp.dateFormat = "M월 d일"
          dfTemp.locale = "ko-kr"
          eventDetailText = `${dfTemp.string(startDate)} – ${dfTemp.string(endDate)}`
        } else {
          eventDetailText = ""
        }
        
        if(data.eventDurationMethod == 2 && isLocationFetched){
          eventDetailText = `${eventDetailText == "" ? "하루 종일" : eventDetailText}${" → " + calendarEvents[j].location.split("\n")[0]}`
        }
      } else if(data.eventDurationMethod == 2){
        eventDetailText = `${startDateText}${isLocationFetched ? " → " + calendarEvents[j].location.split("\n")[0] : ""}`
      } else if(data.eventDurationMethod == 0){
        eventDetailText = `${startDateText} · ${durationText}`
      } else if(data.eventDurationMethod == 1){
        eventDetailText = `${startDateText} → ${endDateText}`
      }
      
      if(isMultiDayEvent){
        if(isSpacerAvailable){ target.addSpacer(5) }
      } else if(j){
        let s0 = new Date(calendarEvents[j-1].startDate).setHours(0,0,0,0)
        let e0 = new Date(calendarEvents[j-1].endDate).setHours(0,0,0,0)
        let s1 = new Date(calendarEvents[j].startDate).setHours(0,0,0,0)
        
        if((calendarEvents[j-1].isAllDay && e0 != s1) || (!calendarEvents[j-1].isAllDay && s0 != s1)){
          if(isSpacerAvailable){ target.addSpacer(5) }
          
          let dfTemp = new DateFormatter()
          dfTemp.dateFormat = "EEEE"
          dfTemp.locale = "ko-kr"
          
          let dateMarker = target.addText(oneWeekAfter > startDate.getTime() ? `${dfTemp.string(startDate)}` : `${dfShorten.string(startDate)}`)
          dateMarker.textColor = primaryTextColor
          dateMarker.textOpacity = 0.7
          setTextProperty("dateMarker", dateMarker)
        }
      } else if(startDate.setHours(0,0,0,0) != dtInitial){
        let dfTemp = new DateFormatter()
        dfTemp.dateFormat = "EEEE"
        dfTemp.locale = "ko-kr"
        
        let dateMarker = target.addText(oneWeekAfter > startDate.getTime() ? `${dfTemp.string(startDate)}` : `${dfShorten.string(startDate)}`)
        dateMarker.textColor = primaryTextColor
        dateMarker.textOpacity = 0.7
        setTextProperty("dateMarker", dateMarker)
      }
      
      let eventPacker = target.addStack()
      eventPacker.centerAlignContent()
      if(!calendarEvents[j].isAllDay){
        eventPacker.backgroundColor = new Color(calendarEvents[j].calendar.color.hex, 0.2)
        eventPacker.cornerRadius = 6
      }
      
      let marker = eventPacker.addStack()
      marker.size = new Size(4, eventDetailText != "" ? 24 : 12)
      marker.cornerRadius = 2
      marker.backgroundColor = new Color(calendarEvents[j].calendar.color.hex)
      
      eventPacker.addSpacer(4)
      
      let vStack = eventPacker.addStack()
      vStack.layoutVertically()

      vStack.url = getiOSCalendarScheme(startDate.getTime())
      
      let hSpacer = vStack.addStack()
      hSpacer.addSpacer()
      
      let eventTitle = vStack.addText(calendarEvents[j].title)
      eventTitle.lineLimit = 1
      eventTitle.textColor = primaryTextColor
      setTextProperty("eventTitle", eventTitle)
      
      if(eventDetailText != ""){
        let eventDuration = vStack.addText(eventDetailText)
        eventDuration.lineLimit = 1
        // eventDuration.minimumScaleFactor = 0.7
        eventDuration.textColor = primaryTextColor
        eventDuration.textOpacity = calendarEvents[j].isAllDay ? 1.0 : 0.7
        setTextProperty("eventDuration", eventDuration)
      }
      
      if((isSpacerAvailable) && j != minimumEvents - 1){ target.addSpacer(2) }
    }
    
  } else if(data.layout[i] == "reminder"){
    // ReminderView
    let reminders = (await Calendar.forReminders()).filter(i => data.reminders.indexOf(i.identifier) != -1)
    let reminderEvents = data.showForTimedReminders ? (data.showTodayReminders ? await Reminder.allDueToday(reminders) : await Reminder.scheduled(reminders)) : await Reminder.allIncomplete(reminders)
    if(!data.showLateReminders){ reminderEvents = reminderEvents.filter(i => !i.isOverdue) }
    
    let reminderView = wrapper.addStack()
    reminderView.layoutVertically()

    if(model.showBorder){
      reminderView.borderWidth = 2
      reminderView.borderColor = Color.purple()
    }
    
    if(data.sortReminderByTime){
      reminderEvents = reminderEvents.sort(function(a, b){
        let p = a.dueDate == null ? 0 : new Date(a.dueDate).getTime()
        let q = b.dueDate == null ? 0 : new Date(b.dueDate).getTime()
        return p - q
      })
    }
    
    let minimumReminders = Math.min(reminderEvents.length, data.reminderLength)
    for(let i = 0; i < minimumReminders; i++){
      let stack = reminderView.addStack()
      stack.centerAlignContent()
      stack.url = "x-apple-reminderkit://"
      
      let marker = stack.addStack()
      marker.size = new Size(6,6)
      marker.cornerRadius = 3
      marker.backgroundColor = new Color(reminderEvents[i].calendar.color.hex)
      
      stack.addSpacer(3)
      
      let text = stack.addText(reminderEvents[i].title)
      text.textColor = primaryTextColor
      text.lineLimit = 1
      setTextProperty("reminderTitle", text)
      
      stack.addSpacer(3)
      
      if(reminderEvents[i].dueDate != null){
        let dueDate = new Date(reminderEvents[i].dueDate)
        let dueString = ""
        if(reminderEvents[i].dueDateIncludesTime){
          dueString = dfTime.string(new Date(reminderEvents[i].dueDate))
        } else if(dueDate.setHours(0,0,0,0) == dtInitial){
          dueString = "오늘"
        }
        if(dueDate.setHours(0,0,0,0) != dtInitial){
          dueString = dfShorten.string(dueDate) + " " + dueString
        }
        
        let dueText = stack.addText(dueString)
        dueText.lineLimit = 1
        dueText.textColor = primaryTextColor
        dueText.textOpacity = 0.7
        setTextProperty("reminderDate", dueText)
      }

      stack.addSpacer()

      if(i != minimumReminders - 1){ reminderView.addSpacer(2) }
    }

  } else if(data.layout[i] == "appleWeather"){
    // APWKView
    
    const conditionCodes = [
      "Clear", "Cloudy", "Dust", "Fog", "Haze", "MostlyClear", "MostlyCloudy",
      "PartlyCloudy", "ScatteredThunderstorms", "Smoke", "Breezy", "Windy",
      "Drizzle", "HeavyRain", "Rain", "Showers", "Flurries", "HeavySnow",
      "MixedRainAndSleet", "MixedRainAndSnow", "MixedRainfall", "MixedSnowAndSleet",
      "ScatteredShowers", "ScatteredSnowShowers", "Sleet", "Snow", "SnowShowers",
      "Blizzard", "BlowingSnow", "FreezingDrizzle", "FreezingRain", "Frigid",
      "Hail", "Hot", "Hurricane", "IsolatedThunderstorms", "SevereThunderstorm",
      "Thunderstorms", "Tornado", "TropicalStorm"
    ]
    
    const conditionActualWords = {
      "en": [
        "Clear", "Cloudy", "Dust", "Fog", "Haze", "Mostly Clear", "Mostly Cloudy",
        "Partly Cloudy", "Scattered Thunderstorms", "Smoke", "Breezy", "Windy",
        "Drizzle", "Heavy Rain", "Rain", "Showers", "Flurries", "Heavy Snow",
        "Mixed Rain & Sleet", "Mixed Rain & Snow", "Mixed Rainfall", "Mixed Snow & Sleet",
        "Scattered Showers", "Scattered Snow Showers", "Sleet", "Snow", "Snow Showers",
        "Blizzard", "Blowing Snow", "Freezing Drizzle", "Freezing Rain", "Frigid",
        "Hail", "Hot", "Hurricane", "Isolated Thunderstorms", "Severe Thunderstorm",
        "Thunderstorms", "Tornado", "Tropical Storm"
      ], "kr": [
        "청명함", "흐림", "먼지", "안개", "실안개", "대체로 청명함", "대체로 흐림",
        "한때 흐림", "산발적인 뇌우", "연기", "미풍", "바람",
        "이슬비", "호우", "비", "소나기", "돌풍", "폭설",
        "비와 우빙", "비와 눈", "혼합 강우", "눈과 우빙",
        "산발적인 소나기", "산발적인 소낙눈", "우빙", "눈", "소낙눈",
        "눈보라", "날린 눈", "진눈깨비", "우빙", "한파",
        "우박", "폭염", "허리케인", "국지성 뇌우", "심한 뇌우",
        "뇌우", "토네이도", "열대성 폭풍우"
      ]
    }
    
    function getConditionString(conditionCode){
      let i = conditionCodes.indexOf(conditionCode)
      if(i == -1){ return conditionCode }
      else if(data.weatherAlternativeDesc){ return conditionActualWords.kr[i] }
      else { return conditionActualWords.en[i] }
    }
    
    const conditionSymbol = [
      "sun.max.fill", "cloud.fill", "sun.dust.fill", "cloud.fog.fill", "cloud.fog.fill", "sun.max.fill", "cloud.fill",
      "cloud.sun.fill", "cloud.bolt.rain.fill", "smoke.fill", "wind", "wind",
      "cloud.drizzle.fill", "cloud.heavyrain.fill", "cloud.rain.fill", "cloud.drizzle.fill", "wind", "snowflake",
      "cloud.sleet.fill", "cloud.snow.fill", "cloud.hail.fill", "cloud.sleet.fill",
      "cloud.sleet.fill", "cloud.sleet.fill", "cloud.sleet.fill", "snowflake", "cloud.snow.fill",
      "cloud.snow.fill", "wind.snow", "snowflake", "snowflake", "thermometer.snowflake",
      "cloud.hail.fill", "thermometer.sun.fill", "hurricane", "cloud.bolt.rain.fill", "cloud.bolt.rain.fill",
      "cloud.bolt.rain.fill", "tornado", "tropicalstorm",
      "questionmark"
    ]
    
    const conditionSymbolAlternative = [
      "moon.stars.fill", "cloud.fill", "sun.dust.fill", "cloud.fog.fill", "cloud.fog.fill", "moon.stars.fill", "cloud.fill",
      "cloud.moon.fill", "cloud.bolt.rain.fill", "smoke.fill", "wind", "wind",
      "cloud.drizzle.fill", "cloud.heavyrain.fill", "cloud.rain.fill", "cloud.drizzle.fill", "wind", "snowflake",
      "cloud.sleet.fill", "cloud.snow.fill", "cloud.heavyrain.fill", "cloud.sleet.fill",
      "cloud.sleet.fill", "cloud.sleet.fill", "cloud.sleet.fill", "snowflake", "cloud.snow.fill",
      "cloud.snow.fill", "wind.snow", "snowflake", "snowflake", "thermometer.snowflake",
      "cloud.hail.fill", "thermometer.sun.fill", "hurricane", "cloud.bolt.rain.fill", "cloud.bolt.rain.fill",
      "cloud.bolt.rain.fill", "tornado", "tropicalstorm",
      "questionmark"
    ]
    
    const precipitationType = [
      "clear", "precipitation", "rain", "snow", "sleet", "hail", "mixed"
    ]
    
    const pressureTrends = [
      "rising", "falling", "steady"
    ]
    
    const pressureTrendSymbol = [
      "arrow.up", "arrow.down", "equal"
    ]
    
    apwkData.forecastDaily.days = (apwkData.forecastDaily.days).filter(i => dt < new Date(i.forecastEnd).getTime())
    
    let sunriseToday = new Date(apwkData.forecastDaily.days[0].sunrise)
    let sunsetToday = new Date(apwkData.forecastDaily.days[0].sunset)
    
    let sunriseTomorrow = new Date(apwkData.forecastDaily.days[1].sunrise)
    
    let solarSymbol; let solarTime;
    /*
    if(dt > sunsetToday){
      solarSymbol = "sunrise.fill"
      solarTime = sunriseTomorrow.getTime()
    }
    */
    
    if(dt > sunriseToday){
      solarSymbol = "sunset.fill"
      solarTime = sunsetToday.getTime()
    } else {
      solarSymbol = "sunrise.fill"
      solarTime = sunriseToday.getTime()
    }
    
    function convertToF(temp){ return Math.round(temp * 9/5 + 32) }
    
    // apwdTempView
    if(data.apwdTemp){
      let apwdTempView = wrapper.addStack()
      apwdTempView.centerAlignContent()
      apwdTempView.url = apwkData.currentWeather.metadata.attributionURL

      if(model.showBorder){
        apwdTempView.borderWidth = 2
        apwdTempView.borderColor = Color.purple()
      }
      
      if(data.itmAlignment > 0){ apwdTempView.addSpacer() }
      else if(data.itmSpacerOffset){ apwdTempView.addSpacer(data.itmSpacerOffset) }
      
      let conditionText = apwdTempView.addText(getConditionString(apwkData.currentWeather.conditionCode))
      conditionText.font = Font.boldSystemFont(20)
      conditionText.textColor = primaryTextColor
      
      apwdTempView.addSpacer(5)
      
      let currentTemp = apwkData.currentWeather.temperature
      if(data.weatherCtoF){ currentTemp = convertToF(currentTemp) }
      else { currentTemp = Math.round(currentTemp) }
      
      let tempText = apwdTempView.addText(currentTemp + "°")
      tempText.font = Font.lightRoundedSystemFont(20)
      tempText.textColor = primaryTextColor
      
      let temp = conditionCodes.indexOf(apwkData.currentWeather.conditionCode)
      let tempIcon = apwdTempView.addImage(getSymbolImage(dt > sunriseToday.getTime() && dt < sunsetToday.getTime() ? conditionSymbol[temp] : conditionSymbolAlternative[temp], 32))
      tempIcon.imageSize = new Size(20,20)
      tempIcon.imageOpacity = 0.8
      
      // apwdSolarMovement
      if(data.apwdSolarMovement){
        apwdTempView.addSpacer(8)
        
        let solarIcon = apwdTempView.addImage(getSymbolImage(solarSymbol, 32))
        solarIcon.imageSize = primaryIconSize
        solarIcon.imageOpacity = 0.8
        
        let solarText = apwdTempView.addText(dfTime.string(new Date(solarTime)))
        setTextProperty("awSolarText", solarText)
        solarText.textColor = primaryTextColor
        solarText.textOpacity = 0.8
      }
      
      if(data.itmAlignment < 2){ apwdTempView.addSpacer() }
      else if(data.itmSpacerOffset){ apwdTempView.addSpacer(data.itmSpacerOffset) }
      
      if(data.apwdDetail || data.apwdHourly || data.apwdDaily){ wrapper.addSpacer(5) }
    }
    
    // apwdDetailView
    if(data.apwdDetail){
      let apwdDetailView = wrapper.addStack()
      apwdDetailView.centerAlignContent()

      if(model.showBorder){
        apwdDetailView.borderWidth = 2
        apwdDetailView.borderColor = Color.purple()
      }
      
      if(data.itmAlignment > 0){ apwdDetailView.addSpacer() }
      else if(data.itmSpacerOffset){ apwdDetailView.addSpacer(data.itmSpacerOffset) }
      
      if(data.apwdPressure){
        let pressureStack = apwdDetailView.addStack()
        pressureStack.centerAlignContent()
        pressureStack.setPadding(4,4,4,4)
        pressureStack.backgroundColor = primaryStackColor
        pressureStack.cornerRadius = 9
        
        let pressureIcon = pressureStack.addImage(getSymbolImage("gauge", 32))
        pressureIcon.imageSize = primaryIconSize
        pressureIcon.tintColor = primaryTextColor
        pressureIcon.imageOpacity = 0.8
        
        let pressureText = pressureStack.addText("기압 " + Math.round(apwkData.currentWeather.pressure).toLocaleString() + "hPa")
        setTextProperty("awDetailText", pressureText)
        pressureText.textColor = primaryTextColor
        pressureText.lineLimit = 1
        
        pressureStack.addSpacer(2)
        
        let pressureTrendIcon = pressureStack.addImage(getSymbolImage(pressureTrendSymbol[pressureTrends.indexOf(apwkData.currentWeather.pressureTrend)], 32))
        pressureTrendIcon.imageSize = new Size(14,14)
        pressureTrendIcon.tintColor = primaryTextColor
        pressureTrendIcon.imageOpacity = 0.8
        
        apwdDetailView.addSpacer(7)
      }
      
      if(data.apwdHumidity){
        addSimpleBlock("humidity", "습도 " + Math.round(apwkData.currentWeather.humidity * 100) + "%")
        apwdDetailView.addSpacer(7)
      }
      
      if(data.apwdApparentTemp){
        let currentTempApparent = apwkData.currentWeather.temperatureApparent
        if(data.weatherCtoF){ currentTempApparent = convertToF(currentTempApparent) }
        else { currentTempApparent = Math.round(currentTempApparent) }
        
        addSimpleBlock("thermometer", "체감 " + currentTempApparent + "°")
      }

      if(data.itmAlignment < 2){ apwdDetailView.addSpacer() }
      else if(data.itmSpacerOffset){ apwdDetailView.addSpacer(data.itmSpacerOffset) }
      
      if(data.apwdPrecip || data.apwdWindSpeed || data.apwdUvIndex){ wrapper.addSpacer(3) }
      
      // apwdDetailView2
      let apwdDetailView2 = wrapper.addStack()
      apwdDetailView2.centerAlignContent()

      if(model.showBorder){
        apwdDetailView2.borderWidth = 2
        apwdDetailView2.borderColor = Color.purple()
      }
      
      if(data.itmAlignment > 0){ apwdDetailView2.addSpacer() }
      else if(data.itmSpacerOffset){ apwdDetailView2.addSpacer(data.itmSpacerOffset) }
      
      if(data.apwdPrecip){
        addSimpleBlock("drop.fill", "강수량 " + apwkData.currentWeather.precipitationIntensity + "mm", apwdDetailView2)
        apwdDetailView2.addSpacer(7)
      }
      
      if(data.apwdWindSpeed){
        addSimpleBlock("wind", "바람 " + Math.round(apwkData.currentWeather.windSpeed / 3.6) + "m/s", apwdDetailView2)
        apwdDetailView2.addSpacer(7)
      }
      
      if(data.apwdUvIndex){
        addSimpleBlock("sun.max.fill", "자외선 지수 " + Math.round(apwkData.currentWeather.uvIndex), apwdDetailView2)
      }

      if(data.itmAlignment < 2){ apwdDetailView2.addSpacer() }
      else if(data.itmSpacerOffset){ apwdDetailView2.addSpacer(data.itmSpacerOffset) }
      
      if(data.apwdHourly || data.apwdDaily){ wrapper.addSpacer(3) }
      
      function addSimpleBlock(iconSymbol, blockText, target = apwdDetailView){
        let stack = target.addStack()
        stack.centerAlignContent()
        stack.setPadding(4,4,4,4)
        stack.backgroundColor = primaryStackColor
        stack.cornerRadius = 9
        
        let icon = stack.addImage(getSymbolImage(iconSymbol, 32))
        icon.imageSize = primaryIconSize
        icon.tintColor = primaryTextColor
        icon.imageOpacity = 0.8
        
        let text = stack.addText(blockText)
        setTextProperty("awDetailText", text)
        text.textColor = primaryTextColor
        text.lineLimit = 1
      }
    }
    
    // ForecastHourly
    if(data.apwdHourly){
      let hourlyForecasts = wrapper.addStack()
      hourlyForecasts.centerAlignContent()

      if(model.showBorder){
        hourlyForecasts.borderWidth = 2
        hourlyForecasts.borderColor = Color.purple()
      }
      
      apwkData.forecastHourly.hours = apwkData.forecastHourly.hours.filter(i => new Date(i.forecastStart).getTime() > dt)
      for(let i = 0; i < 6; i++){
        let hourlyData = apwkData.forecastHourly.hours[i]
        let stack = hourlyForecasts.addStack()
        stack.layoutVertically()
        stack.backgroundColor = primaryStackColor
        stack.cornerRadius = 9
        
        stack.size = new Size(0, 65)
        stack.setPadding(0,0,0,0)
        
        let hSpacer = stack.addStack()
        hSpacer.addSpacer()
        
        let df0 = new DateFormatter()
        df0.locale = "ko-kr"
        df0.dateFormat = "a h시"
        
        let titleStack = stack.addStack()
        titleStack.size = new Size((model.stackWidth - 10) / 6, 0)
        titleStack.layoutVertically()

        let inStack = titleStack.addStack()
        inStack.size = new Size((model.stackWidth - 10) / 6, 0)
        inStack.layoutHorizontally()
        
        let dt0 = new Date(hourlyData.forecastStart)
        
        let hourlyTitle = inStack.addText(dtDate.getHours() == dt0.getHours() ? "지금" : df0.string(dt0))
        hourlyTitle.font = Font.boldMonospacedSystemFont(8)
        hourlyTitle.textColor = primaryTextColor
        hourlyTitle.textOpacity = 0.6
        hourlyTitle.lineLimit = 1
        
        stack.addSpacer(3)
        
        let symbolStack = stack.addStack()
        symbolStack.addSpacer()
        
        let temp = conditionCodes.indexOf(hourlyData.conditionCode)
        if(temp == -1){ temp = conditionSymbol.length - 1 }
        
        let hourlySymbol = symbolStack.addImage(getSymbolImage(dt0.getTime() > sunriseToday.getTime() && dt0.getTime() < sunsetToday.getTime() ? conditionSymbol[temp] : conditionSymbolAlternative[temp], 32))
        hourlySymbol.imageSize = new Size(25,25)
        
        symbolStack.addSpacer()
        
        stack.addSpacer(3)
        
        let tempStack = stack.addStack()
        tempStack.addSpacer()
        
        let currentTemp = hourlyData.temperature
        if(data.weatherCtoF){ currentTemp = convertToF(currentTemp) }
        else { currentTemp = Math.round(currentTemp) }
        
        let tempText = tempStack.addText(currentTemp + "°")
        tempText.font = Font.mediumMonospacedSystemFont(15)
        tempText.textColor = primaryTextColor
        tempText.textOpacity = 0.8
        
        tempStack.addSpacer()
        
        if(i!=5){ hourlyForecasts.addSpacer(2) }
      }
      
      if(data.apwdDaily){ wrapper.addSpacer(2) }
    }
    
    // ForecastDaily
    if(data.apwdDaily){
      let dailyForecasts = wrapper.addStack()
      dailyForecasts.centerAlignContent()

      if(model.showBorder){
        dailyForecasts.borderWidth = 2
        dailyForecasts.borderColor = Color.purple()
      }
      
      for(let i = 1; i < 4; i++){
        let dailyData = apwkData.forecastDaily.days[i]
        let stack = dailyForecasts.addStack()
        stack.layoutVertically()
        stack.backgroundColor = primaryStackColor
        stack.cornerRadius = 9
        
        stack.size = new Size(0, 50)
        stack.setPadding(0,5,0,5)
        
        let hSpacer = stack.addStack()
        hSpacer.addSpacer()
        
        let hStack = stack.addStack()
        hStack.centerAlignContent()
        
        let df0 = new DateFormatter()
        df0.locale = "ko-kr"
        df0.dateFormat = "E"
        
        let dt0 = new Date(dailyData.forecastStart)
        let dailyTitle = hStack.addText(df0.string(dt0))
        dailyTitle.font = Font.boldMonospacedSystemFont(13)
        dailyTitle.textColor = primaryTextColor
        dailyTitle.textOpacity = 0.7
        
        hStack.addSpacer()
        
        let vStack = hStack.addStack()
        vStack.layoutVertically()
        
        let temp = conditionCodes.indexOf(dailyData.daytimeForecast.conditionCode)
        if(temp == -1){ temp = conditionSymbol.length - 1 }
        
        let dailySymbol = vStack.addImage(getSymbolImage(conditionSymbol[temp], 32))
        dailySymbol.imageSize = new Size(25,25)
        
        let pChance = dailyData.daytimeForecast.precipitationChance.toFixed(1) * 100
        let precipitationTag = ["precipitation", "rain"]
        if(precipitationTag.indexOf(dailyData.daytimeForecast.precipitationType) != -1 && pChance > 0){
          let pChanceText = vStack.addText(pChance + "%")
          pChanceText.font = Font.mediumMonospacedSystemFont(11)
          pChanceText.textColor = primaryTextColor
          pChanceText.textOpacity = 0.5
        }
        
        hStack.addSpacer()
        
        let maxTempNumber = dailyData.temperatureMax
        let minTempNumber = dailyData.temperatureMin
        if(data.weatherCtoF){
          maxTempNumber = convertToF(maxTempNumber)
          minTempNumber = convertToF(minTempNumber)
        }
        else {
          maxTempNumber = Math.round(maxTempNumber)
          minTempNumber = Math.round(minTempNumber)
        }
        
        let minMaxTemp = hStack.addStack()
        minMaxTemp.layoutVertically()
        
        let maxTemp = minMaxTemp.addText(maxTempNumber + "°")
        maxTemp.font = Font.mediumMonospacedSystemFont(15)
        maxTemp.textColor = primaryTextColor
        
        let minTemp = minMaxTemp.addText(minTempNumber + "°")
        minTemp.font = Font.mediumMonospacedSystemFont(15)
        minTemp.textColor = primaryTextColor
        minTemp.textOpacity = 0.6
        
        if(i!=3){ dailyForecasts.addSpacer(2) }
      }
    }
    
  } else if(data.layout[i] == "openWeather"){
    // OpenWeatherView
    
    
  } else if(data.layout[i] == "covid"){
    // CovidView
    let covidView = wrapper.addStack()
    covidView.centerAlignContent()
    covidView.url = "http://ncov.mohw.go.kr/bdBoardList_Real.do?brdId=1&brdGubun=13&ncvContSeq=&contSeq=&board_id=&gubun="
    
    if(model.showBorder){
      covidView.borderWidth = 2
      covidView.borderColor = Color.red()
    }
    
    if(data.itmAlignment > 0){ covidView.addSpacer() }
    else if(data.itmSpacerOffset){ covidView.addSpacer(data.itmSpacerOffset) }

    let covidIcon = covidView.addImage(getSymbolImage("allergens", 32))
    covidIcon.tintColor = primaryTextColor
    covidIcon.imageSize = primaryIconSize
    covidIcon.imageOpacity = 0.8

    covidView.addSpacer(3)

    let covidMainText = covidView.addText(`어제 총합 ${covidData.totalPrev.toLocaleString()}명 · ${covidData.regName} ${covidData.regPrev.toLocaleString()}명`)
    covidMainText.textColor = primaryTextColor
    covidMainText.textOpacity = 0.8
    covidMainText.lineLimit = 1
    setTextProperty("covidTitle", covidMainText)

    if(data.itmAlignment < 2){ covidView.addSpacer() }
    else if(data.itmSpacerOffset){ covidView.addSpacer(data.itmSpacerOffset) }

    if(data.covidShowDetail){
      wrapper.addSpacer(2)

      let temp = covidData.reportedTime.split(' ')
      temp = temp[1].split('.')
      let reportDate = temp[0] + "월 " + temp[1] + "일"

      let covidDetailView = wrapper.addStack()
      covidDetailView.centerAlignContent()
      
      if(model.showBorder){
        covidDetailView.borderWidth = 2
        covidDetailView.borderColor = Color.red()
      }
      
      if(data.itmAlignment > 0){ covidDetailView.addSpacer() }
      else if(data.itmSpacerOffset){ covidDetailView.addSpacer(data.itmSpacerOffset) }

      let covidDetailIcon = covidDetailView.addImage(getSymbolImage("globe.asia.australia.fill", 32))
      covidDetailIcon.tintColor = primaryTextColor
      covidDetailIcon.imageSize = primaryIconSize
      covidDetailIcon.imageOpacity = 0.8

      covidDetailView.addSpacer(3)

      let covidSubText = covidDetailView.addText(`총 확진자 ${covidData.totalConfirmed.toLocaleString()}명 (${reportDate} 기준)`)
      covidSubText.textColor = primaryTextColor
      covidSubText.textOpacity = 0.8
      covidSubText.lineLimit = 1
      setTextProperty("covidTitle", covidSubText)

      if(data.itmAlignment < 2){ covidDetailView.addSpacer() }
      else if(data.itmSpacerOffset){ covidDetailView.addSpacer(data.itmSpacerOffset) }

    }

  }
  
  if(data.itmRepeatOffset){ wrapper.addSpacer(data.itmRepeatOffset) }
}



let padding = data.widgetPadding
widget.setPadding(padding[0], padding[1], padding[2], padding[3])
widget.refreshAfterDate = new Date(Date.now() + 1000 * 300)

// Background setup
let bgmode = data.useSeperateBg ? data.bgmode : model.bgmode
let bghex = data.useSeperateBg ? data.bghex : model.bghex
let bgid = data.useSeperateBg ? data.bgid : model.bgid
bgid = !(Color.dynamic(Color.white(),Color.black()).red) ? bgid[1] : bgid[0]
if(bgmode == 0){
  widget.backgroundColor = new Color(bghex)
} else if(bgmode == 1){
  let imgPath = `${fpath.wdir}/${bgid}/${data.pos}.jpg`
  await checkFileAvailability(imgPath)
  let img = fm.readImage(imgPath)
  widget.backgroundImage = img
} else if(bgmode == 2){
  let imgPath = `${fpath.wdir}/${bgid}.jpg`
  await checkFileAvailability(imgPath)
  let img = fm.readImage(imgPath)
  widget.backgroundImage = img
}

Script.setWidget(widget)
if(config.runsInApp){
  if(data.pos < 10){ widget.presentMedium() }
  else { widget.presentLarge() }
}

dataAll[wid] = data
if(config.runsInWidget){ dataAll[wid].activated = new Date().getTime() }
await fm.writeString(fpath.data, JSON.stringify(dataAll))

return 0
