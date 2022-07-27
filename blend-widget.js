// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-purple; icon-glyph: moon;
const version = "1.0"
let dtDate = new Date()
let dt = dtDate.getTime()


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


// Initial setup
let wid
let ignoreWID = false
let ignoreSizeLimit = false
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
    
    Script.setWidget(widget)
    return 0
  }
  wid = args.widgetParameter
} else if(config.runsInApp && !ignoreWID){
  if(args.queryParameters.wid == undefined){ return 0 }
  wid = args.queryParameters.wid
}

// Load data
let dataAll = JSON.parse(fm.readString(fpath.data))
let data
try{
  data = JSON.parse(JSON.stringify(dataAll[wid]))
} catch(e){
  throw new Error("유효하지 않은 Parameter 값")
}
let model = JSON.parse(fm.readString(fpath.model))
let terrace = JSON.parse(fm.readString(fpath.wall))

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

// textProperty
let primaryTextColor = Color.dynamic(new Color(data.textColor[0]), new Color(data.textColor[1]))


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


// Main code

let blend = new ListWidget()

// Layout Part
for(let i = 0; i < data.layout.length; i++){
  if(data.layout[i] == "spacer" || data.layout[i] == "spacer2"){
    // VerticalSpacer
    blend.addSpacer()
  } else if(data.layout[i] == "text" && data.textString){
    // Text
    let simpleText = blend.addText(data.textString)
    simpleText.textColor = primaryTextColor
    setTextProperty("simpleText", simpleText)
    
  } else if(data.layout[i] == "date"){
    // Date
    let dateText = blend.addText(df.string(dtDate))
    dateText.textColor = primaryTextColor
    setTextProperty("dateText", dateText)
    
  } else if(data.layout[i] == "calendar"){
    // CalendarView
    let calendars = (await Calendar.forEvents()).filter(i => data.calendars.indexOf(i.identifier) != -1)
    let calendarEvents = data.showTodayEvents ? await CalendarEvent.today(calendars) : await CalendarEvent.between(new Date(dt), new Date(dt + 1000 * 60 * 60 * 24 * data.distanceEventStartDate), calendars)
    let allDayEvents = calendarEvents.filter(i => i.isAllDay)
    calendarEvents = calendarEvents.filter(i => !i.isAllDay)
    calendarEvents = calendarEvents.filter(i => dt - new Date(i.startDate).getTime() < 1000 * 60 * data.delayHideEventsMin)
    
    if(!calendarEvents.length){
      let noEventText = blend.addText("다가오는 이벤트 없음")
      noEventText.textColor = primaryTextColor
      setTextProperty("noEventText", noEventText)
      
    }
    
    let allDay = {}
    if(data.showAllDayEvents){
      for(let j = 0; j < allDayEvents.length; j++){
        let sdt = new Date(allDayEvents[j].startDate).getTime()
        if(allDay[sdt] == undefined){
          allDay[sdt] = [allDayEvents[j].title]
        } else {
          allDay[sdt].push(allDayEvents[j].title)
        }
      }
    }
    
    let calendarView = blend.addStack()
    calendarView.layoutVertically()
    
    let outerStack = calendarView.addStack()
    
    let calendarLeft = outerStack.addStack()
    calendarLeft.layoutVertically()
    
    let spacerLeft = calendarLeft.addStack()
    spacerLeft.addSpacer()
    
    let calendarRight = outerStack.addStack()
    calendarRight.layoutVertically()
    
    let spacerRight = calendarRight.addStack()
    spacerRight.addSpacer()
    
    for(let j = 0; j < Math.min(calendarEvents.length, data.calendarLength); j++){
      let stack; let target
      let mid = Math.ceil(data.calendarLength / 2)
      
      if(data.calendarTwoRow){ target = j >= mid ? calendarRight : calendarLeft }
      else { target = calendarView }
      
      let startDate = new Date(calendarEvents[j].startDate)
      if(!j){
        if(dtDate.getDate() != startDate.getDate()){
          let dateMarker = target.addText(dfShorten.string(startDate))
          dateMarker.textColor = primaryTextColor
          dateMarker.textOpacity = 0.7
          setTextProperty("dateMarker", dateMarker)
        }
        
        addAllDayBanner(startDate.getTime())
      } else if(startDate.getDate() != new Date(calendarEvents[j-1].startDate).getDate()){
        let dateMarker = target.addText(dfShorten.string(startDate))
        dateMarker.textColor = primaryTextColor
        dateMarker.textOpacity = 0.7
        setTextProperty("dateMarker", dateMarker)
        
        addAllDayBanner(startDate.getTime())
      }
      
      function addAllDayBanner(ms){
        let temp = new Date(ms).setHours(0,0,0,0)
        if(allDay[temp] == undefined){ return 0 }
        let allDayMarker = target.addText(allDay[temp].length > 1 ? `종일: ${allDay[temp][0]} 등 ${allDay[temp].length}개` : `종일: ${allDay[temp][0]}`)
        allDayMarker.textColor = primaryTextColor
        allDayMarker.textOpacity = 1.0
        setTextProperty("dateMarker", allDayMarker)
      }
      
      stack = target.addStack()
      stack.centerAlignContent()
      
      let marker = stack.addStack()
      marker.size = new Size(4,12)
      marker.backgroundColor = new Color(calendarEvents[j].calendar.color.hex)
      
      stack.addSpacer(4)
      
      let eventTitle = stack.addText(calendarEvents[j].title)
      eventTitle.lineLimit = 1
      eventTitle.textColor = primaryTextColor
      setTextProperty("eventTitle", eventTitle)
      
      // let startDateText = startDate.getDate() == dtDate.getDate() ? `${dfTime.string(startDate)}` : `${dfShorten.string(startDate)} ${dfTime.string(startDate)}`
      let startDateText = `${dfTime.string(startDate)}`
      
      let endDate = new Date(calendarEvents[j].endDate)
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
      
      let eventDetailText
      if(data.eventDurationMethod == 2){
        eventDetailText = `${startDateText}${isLocationFetched ? " → " + calendarEvents[j].location.split("\n")[0] : ""}`
      } else if(calendarEvents[j].isAllDay){
        eventDetailText = `${dfShorten.string(startDate)}`
      } else if(data.eventDurationMethod == 0){
        eventDetailText = `${startDateText} · ${durationText}`
      } else if(data.eventDurationMethod == 1){
        eventDetailText = `${startDateText} → ${endDateText}`
      }
      
      let eventDuration = target.addText(eventDetailText)
      eventDuration.lineLimit = 1
      eventDuration.textColor = primaryTextColor
      eventDuration.textOpacity = calendarEvents[j].isAllDay ? 1.0 : eventTitle.textOpacity * 0.7
      setTextProperty("eventDuration", eventDuration)
      
      if(!data.calendarTwoRow && data.eventDurationMethod == 2 && isLocationFetched && calendarEvents[j].location.split("\n").length > 1){
        let locationText = calendarView.addText((calendarEvents[j].location).split("\n")[1])
        locationText.lineLimit = 1
        locationText.textColor = primaryTextColor
        locationText.textOpacity = eventTitle.textOpacity * 0.6
      }
      
      target.addSpacer(7)
    }
    
  } else if(data.layout[i] == "reminder"){
    // ReminderView
    let reminders = (await Calendar.forReminders()).filter(i => data.reminders.indexOf(i.identifier) != -1)
    let reminderEvents = data.showForTimedReminders ? (data.showTodayReminders ? await Reminder.allDueToday(reminders) : await Reminder.scheduled(reminders)) : await Reminder.allIncomplete(reminders)
    if(!data.showLateReminders){ reminderEvents = reminderEvents.filter(i => !i.isOverdue) }
    
    console.log(reminderEvents)

    for(let i = 0; i < Math.min(reminderEvents.length, data.reminderLength); i++){
      let stack = blend.addStack()
      stack.centerAlignContent()
      
      let dot = stack.addStack()
      dot.size = new Size(11, 11)
      dot.borderWidth = 4
      dot.borderColor = new Color(reminderEvents[i].calendar.color.hex)
      dot.cornerRadius = 5.5

      stack.addSpacer(3)

      let text = stack.addText(reminderEvents[i].title)
      text.textColor = primaryTextColor
      setTextProperty("reminderTitle", text)
      
      if(reminderEvents[i].dueDate != null){
        stack.addSpacer(4)
        let dueDate = new Date(reminderEvents[i].dueDate)
        let dueString = dueDate.setHours(0,0,0,0) == dtDate.setHours(0,0,0,0) ? "" : dfShorten.string(dueDate) + " "
        if(reminderEvents[i].dueDateIncludesTime){ dueString = dueString + dfTime.string(new Date(reminderEvents[i].dueDate)) }
        let dueText = stack.addText(dueString)
        dueText.lineLimit = 1
        dueText.textColor = primaryTextColor
        dueText.textOpacity = 0.7
        setTextProperty("reminderTitle", dueText)
      }

      blend.addSpacer(2)
    }

  } else if(data.layout[i] == "appleWeather"){
    // APWKView
    
  } else if(data.layout[i] == "openWeather"){
    // OpenWeatherView
    
  } else if(data.layout[i] == "covid"){
    // CovidView
    
  }
  
  blend.addSpacer(4)
}



let padding = data.widgetPadding
blend.setPadding(padding[0], padding[1], padding[2], padding[3])
blend.refreshAfterDate = new Date(Date.now() + 1000 * 300)

// Background setup
let bgmode = data.useSeperateBg ? data.bgmode : model.bgmode
let bghex = data.useSeperateBg ? data.bghex : model.bghex
let bgid = data.useSeperateBg ? data.bgid : model.bgid
bgid = !(Color.dynamic(Color.white(),Color.black()).red) ? bgid[1] : bgid[0]
if(bgmode == 0){
  blend.backgroundColor = new Color(bghex)
} else if(bgmode == 1){
  let imgPath = `${fpath.wdir}/${bgid}/${data.pos}.jpg`
  await checkFileAvailability(imgPath)
  let img = fm.readImage(imgPath)
  blend.backgroundImage = img
} else if(bgmode == 2){
  let imgPath = `${fpath.wdir}/${bgid}.jpg`
  await checkFileAvailability(imgPath)
  let img = fm.readImage(imgPath)
  blend.backgroundImage = img
}

Script.setWidget(blend)
if(config.runsInApp){
  if(data.pos < 10){ blend.presentMedium() }
  else { blend.presentLarge() }
}

dataAll[wid] = data
dataAll[wid].activated = new Date().getTime()
fm.writeString(fpath.data, JSON.stringify(dataAll))
