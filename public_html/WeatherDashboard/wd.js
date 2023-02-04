let nowDT = new Date();
let endDT;
let calcCt = 0;
$(document).ready(function() {
  // fetch 2 days of data on the Penobscot (01034500) and the Royal (01060000)
  // note that fetch is an asynch function so global variables declared inside will not be ready before complier conintues onward
  // this is why the JSCharting part of the script remains inside the fetch function

  function ProcedureOne() {
    fetch("https://waterservices.usgs.gov/nwis/iv/?format=json&indent=on&sites=01060000,01034500&period=P30D&parameterCd=00060,00065&siteStatus=all")
      .then((response) => {return response.json()})
      .then((data) => {
        const JSON1 = data;
        // Parse JSON to get flow values, stage, and datetimes -- outputs are arrays i.e. [18000,18100,18300, ...]
        //Penobscot River
        const JSONpbV = JSON1.value.timeSeries[0].values[0].value.map(a => a.value); //.map(function(a) {return a.value;});
        const JSONpbH = JSON1.value.timeSeries[1].values[0].value.map(a => a.value);
        const JSONpbDT = JSON1.value.timeSeries[0].values[0].value.map(a => a.dateTime);
        //Royal River
        const JSONryV = JSON1.value.timeSeries[2].values[0].value.map(a => a.value);
        const JSONryH = JSON1.value.timeSeries[3].values[0].value.map(a => a.value);
        const JSONryDT = JSON1.value.timeSeries[2].values[0].value.map(a => a.dateTime);
        // Used to use regex to remove timezone, but z was inconsistent in data and chart appears to calculate local time fine either way
        //const JSONpbDT1 = JSON.parse(JSON.stringify(JSONpbDT).replace(/.000-04:00/g,""))
        // init array variables
        var PbChartArr = []; var PbFlowArr = []; var PbStageArr = []; var PbDtArr = [];
        var RyChartArr = []; var RyFlowArr = []; var RyStageArr = []; var RyDtArr = [];
        // for each item in array, format chart array with x and y colon-separated, parse individual variables to relevant types
        //Penobscot
        for (let i = 0; i < JSONpbDT.length; i++) {
          PbChartArr[i] = {x:JSONpbDT[i],y:parseInt(JSONpbV[i])};
          PbFlowArr[i] = parseInt(JSONpbV[i]);
          PbStageArr[i] = parseFloat(JSONpbH[i]).toFixed(2);
          PbDtArr[i] = JSONpbDT[i];
          calcCt += 1;
          }
        //Royal River
        for (let i = 0; i < JSONryDT.length; i++) {
          RyChartArr[i] = {x:JSONryDT[i],y:parseInt(JSONryV[i])};
          RyFlowArr[i] = parseInt(JSONryV[i]);
          RyStageArr[i] = parseFloat(JSONryH[i]).toFixed(2);
          RyDtArr[i] = JSONryDT[i];
          //iterate through Royal Flow array and set error values (-999,999) to zero.
          for (let i = 0; i < RyFlowArr.length; i++) {
            calcCt += 1;
            if (RyFlowArr[i] < 0) {
              RyFlowArr[i] = 0
            }}
        }
        // Slice 30 day arrays down to 7 days to feed secondary view, ~(60/15)*24*7
        var PbFlowArr7d = PbFlowArr2.slice(PbFlowArr2.length-168); var RyFlowArr7d = RyFlowArr.slice(RyFlowArr.length-675)
        var PbDtArr7d = PbDtArr2.slice(PbDtArr2.length-168); RyDtArr7d = RyDtArr.slice(RyDtArr.length-675)
        var PbChartArr7d = []; var RyChartArr7d = [];
        for (let i = 0; i < PbDtArr7d.length; i++) {
          PbChartArr7d[i] = {x:PbDtArr7d[i],y:parseInt(PbFlowArr7d[i])};
          calcCt += 1;
          }
        for (let i = 0; i < RyDtArr7d.length; i++) {
          RyChartArr7d[i] = {x:RyDtArr7d[i],y:parseInt(RyFlowArr7d[i])};
          calcCt += 1;
          }
        var ChtStr1 = PbChartArr//.slice(1,-1)
        var ChtStr2 = RyChartArr
        var ChtTest1 = [{x: '2022-09-20T22:30:00.000-04:00', y: 50},{x: '2022-09-20T22:30:00.000-04:15', y: 12},]
        var PBminFlow = Math.min(...PbFlowArr2)-(0.1*(Math.min(...PbFlowArr2))); var RYminFlow = Math.min(...RyFlowArr)-(0.1*(Math.min(...RyFlowArr))) //Math.min(...RyFlowArr)-(0.1*(Math.min(...RyFlowArr))) replaced w padding
        var PBmaxFlow = Math.max(...PbFlowArr2)+(0.1*(Math.max(...PbFlowArr2))); var RYmaxFlow = Math.max(...RyFlowArr)+(0.1*(Math.max(...RyFlowArr))) //Math.max(...RyFlowArr)+(0.1*(Math.max(...RyFlowArr)))
        var PBminFlow7d = Math.min(...PbFlowArr7d)-(0.1*(Math.min(...PbFlowArr7d))); var RYminFlow7d = Math.min(...RyFlowArr7d)-(0.1*(Math.min(...RyFlowArr7d)))
        var PBmaxFlow7d = Math.max(...PbFlowArr7d)+(0.1*(Math.max(...PbFlowArr7d))); var RYmaxFlow7d = Math.max(...RyFlowArr7d)+(0.1*(Math.max(...RyFlowArr7d)))
        //
        //$("#tstStr").html(JSON.stringify(RyChartArr)) //.replace(/.000-04:00/g,"")
        $("#pnFlow").text(PbFlowArr2[PbFlowArr2.length - 1]);
        $("#pnHt").text(PbStageArr[PbStageArr.length - 1]);
        $("#rrFlow").text(RyFlowArr[RyFlowArr.length - 1]);
        $("#rrHt").text(RyStageArr[RyStageArr.length - 1]);
        endDT = new Date();
        $("#lastUpdated").html((PbDtArr[PbDtArr.length - 1]).slice(0,-10).replace("T", " ")+" [LIVE]");
        $("#execSpeed").html((endDT-nowDT)/1000+" seconds");
        $("#recordCount").html(PbChartArr2.length+RyChartArr.length+PbChartArr7d.length+RyChartArr7d.length);
        $("#calcCount").html(calcCt)
        $("#execSpeed").css("color","rgb(123,191,247)");
        $("#recordCount").css("color","rgb(123,191,247)");
        $("#calcCount").css("color","rgb(123,191,247)");
        $.fn.digits = function(){
          return this.each(function(){
              $(this).text( $(this).text().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") );
          })
        };
        $("#recordCount").digits();$("#calcCount").digits();
        $("#cont1 #lastUpdated").css("color","rgb(0, 255, 0)")
        //$("#tstStr").html(JSON.stringify(JSON1))
        // function Update_xAxis7() {
        //   chart.series().options({ type:'Area Step' })
        // };
        // function Update_xAxis30() {
        //   chart.series().options({ type:'Area Spline' })
        // };
        var chart1 = JSC.Chart('chartDiv', {
          debug: true,
          title_label_text:"<b>Penobscot River 90d</b> <span style='color: white'>--</span> <span style='color: rgb(62, 122, 24);font-size:12px;'>USGS 01034500</span>",
          type:'area',
          //defaultTooltip: {label:{text:'%icon %xValue %yValue'}},
          defaultSeries: {
            //shape_opacity: 0.7,
            color:'rgba(39, 151, 245, 0.85)',
            defaultPoint: {marker: {
              type:'none',
              outline: { color: 'white', width: 2 }
            },
            tooltip: '%icon %xValue – %yValue'+' CFS'
          }},
          xAxis: {
            scale_type: 'time',
            crosshair: {enabled: true, onTop: false},
            //scale_range_min: '2022/11/06'
          },
          yAxis_scale: {includeOrigin:true},
          yAxis: {
            scale_type: 'auto',
            //scale: {range: {min:(Math.round(PBminFlow/100)*100),max:(Math.round(PBmaxFlow/100)*100)},interval:(Math.round((PBmaxFlow-PBminFlow)/10))},
            crosshair: {enabled: true, onTop: false},
            label: {
              text: '<b>CFS</b>',
              style: {fontFamily: 'Times New Roman'}
            },
            //defaultTick_label_text: '%value'//,formatString: 'ddd'
            //markers: {color:"red"}
          },
          legend: {
              template: '%name %icon',
              position: 'inside right top'
            },
          series: [{
              name: "<b>Penobscot @ Ripogenus Dam, ME</b>",
              line: {
                color: 'black',
                width: 1,
                //caps_end_type: 'arrow'
              },
              points: PbChartArr2
            }
          ],
        });
        var chart2 = JSC.Chart('chart2Div', {
          debug: true,
          title_label_text:"<b>Royal River 30d</b> <span style='color: white'>--</span> <span style='color: rgb(62, 122, 24);font-size:12px;'>USGS 01060000</span>",
          type:'area',
          //defaultTooltip: {label:{text:'%icon %xValue %yValue'}},
          defaultSeries: {
            //shape_opacity: 0.7,
            color:'rgba(39, 151, 245, 0.85)',
            defaultPoint: {marker: {
              type:'none',
              outline: { color: 'white', width: 2 }
            },
            tooltip: '%icon %xValue – %yValue'+' CFS'
          }},
          xAxis: {
            scale_type: 'time',
            crosshair: {enabled: true, onTop: false}
          },
          yAxis_scale: {includeOrigin:true},
          yAxis: {
            scale_type: 'auto',
            scale: {range: {min:(Math.round(RYminFlow/10)*10),max:(Math.round(RYmaxFlow/10)*10)},interval:(Math.round((RYmaxFlow-RYminFlow)/10))},
            crosshair: {enabled: true, onTop: false},
            label: {
              text: '<b>CFS</b>',
              style: {fontFamily: 'Times New Roman'}
            },
            //defaultTick_label_text: '%value'//,formatString: 'dddYES'
            //markers: {color:"red"}
          },
          legend: {
              template: '%name %icon',
              position: 'inside right top'
            },
          series: [{
              name: "<b>Royal River @ Yarmouth, ME</b>",
              line: {
                color: 'black',
                width: 1,
                //caps_end_type: 'arrow'
              },
              points: ChtStr2
            }
          ],
        });
        var chart3 = JSC.Chart('chart3Div', {
          debug: true,
          title_label_text:"<b>Penobscot River 7d</b> <span style='color: white'>--</span> <span style='color: rgb(62, 122, 24);font-size:12px;'>USGS 01034500</span>",
          type:'area',
          //defaultTooltip: {label:{text:'%icon %xValue %yValue'}},
          defaultSeries: {
            //shape_opacity: 0.7,
            color:'rgba(39, 151, 245, 0.85)',
            defaultPoint: {marker: {
              type:'none',
              outline: { color: 'white', width: 2 }
            },
            tooltip: '%icon %xValue – %yValue'+' CFS'
          }},
          xAxis: {
            scale_type: 'time',
            crosshair: {enabled: true, onTop: false},
            //scale_range_min: '2022/11/06'
          },
          yAxis_scale: {includeOrigin:true},
          yAxis: {
            scale_type: 'auto',
            scale: {range: {min:(Math.round(PBminFlow7d/100)*100),max:(Math.round(PBmaxFlow7d/100)*100)},interval:(Math.round((PBmaxFlow7d-PBminFlow7d)/10))},
            crosshair: {enabled: true, onTop: false},
            label: {
              text: '<b>CFS</b>',
              style: {fontFamily: 'Times New Roman'}
            },
            //defaultTick_label_text: '%value'//,formatString: 'ddd'
            //markers: {color:"red"}
          },
          legend: {
              template: '%name %icon',
              position: 'inside right top'
            },
          series: [{
              name: "<b>Penobscot @ Ripogenus Dam, ME</b>",
              line: {
                color: 'black',
                width: 1,
                //caps_end_type: 'arrow'
              },
              points: PbChartArr7d
            }
          ],
        });
        var chart4 = JSC.Chart('chart4Div', {
          debug: true,
          title_label_text:"<b>Royal River 7d</b> <span style='color: white'>--</span> <span style='color: rgb(62, 122, 24);font-size:12px;'>USGS 01060000</span>",
          type:'area',
          //defaultTooltip: {label:{text:'%icon %xValue %yValue'}},
          defaultSeries: {
            //shape_opacity: 0.7,
            color:'rgba(39, 151, 245, 0.85)',
            defaultPoint: {marker: {
              type:'none',
              outline: { color: 'white', width: 2 }
            },
            tooltip: '%icon %xValue – %yValue'+' CFS'
          }},
          xAxis: {
            scale_type: 'time',
            crosshair: {enabled: true, onTop: false}
          },
          yAxis_scale: {includeOrigin:true},
          yAxis: {
            scale_type: 'auto',
            scale: {range: {min:(Math.round(RYminFlow7d/10)*10),max:(Math.round(RYmaxFlow7d/10)*10)},interval:(Math.round((RYmaxFlow7d-RYminFlow7d)/10))},
            crosshair: {enabled: true, onTop: false},
            label: {
              text: '<b>CFS</b>',
              style: {fontFamily: 'Times New Roman'}
            },
            //defaultTick_label_text: '%value'//,formatString: 'dddYES'
            //markers: {color:"red"}
          },
          legend: {
              template: '%name %icon',
              position: 'inside right top'
            },
          series: [{
              name: "<b>Royal River @ Yarmouth, ME</b>",
              line: {
                color: 'black',
                width: 1,
                //caps_end_type: 'arrow'
              },
              points: RyChartArr7d
            }
          ],
        });
        // function setAxis(val) {
        //   if (val == '7day') {chart.series().options({ type: 'Area Step' });} else {chart.series().options({ type: 'Area Spline' });};
        // };
      });
    };
  //Double nesting to prep McKayStationData
  //Prep DB Connection and Begin Testing
  var PbDtArr2 = [];
  var PbDtArr3 = [];
  var PbDtArrRnd = [];
  var PbFlowArr2 = [];
  var PbChartArr2 = [];
  let rndPbDtArr2 = [];
  let PbFlowArrFull = [];
  let PbDTArrFull = [];
  fetch("McKayDBpull.php")
    .then(response => response.json())
    .then(data => {
        //$("#tstStr3").html(JSON.stringify(data))
        //Data comes in from McKayStationDB with two fields, DateTime and CFS
        PbDtArr2 = data.map(a => a.DateTime.replace(" ","T"))
        PbFlowArr2 = data.map(a => a.CFS)
        //create date objects with systemtime for reference array
        let currentDate = new Date();
        let ninetyDaysAgo = new Date(currentDate.getTime() - 90*24*60*60*1000);
        //prep reference array
        let hourlyDTs = [];
        for (let d = ninetyDaysAgo; d <= currentDate; d.setHours(d.getHours() + 1)) {
          let date = new Date(d);
          // let ESTdate = moment.tz(date, 'America/New_York');
          // let estDT = new Date(ESTdate);
          // let offset = estDT.getTimezoneOffset();
          date.setMinutes(0); //- offset);
          date.setSeconds(0);
          hourlyDTs.push(date.toISOString().slice(0,19));
          calcCt += 1;
        };
        //for each DT in PbDtArr2, convert to date object, set second to zero, round up mins/hrs, offset by TZ so date object doesn't show UTC but reflects EST instead.
        for (let i = 0; i < PbDtArr2.length; i++) {
          //let date = new Date(PbDtArr2[i]);
          let ESTdate = moment.tz(PbDtArr2[i], 'America/New_York')
          let utcDate = ESTdate.clone().utc();
          //utcDate.setSeconds(0);
          //PbDtArr3.push(utcDate.toISOString().slice(0,19));
          let minutes = utcDate.minute();
          utcDate.seconds(0);
          calcCt += 1;
          //date.setMinutes(0 - offset);
          if (minutes >= 30) {
            utcDate.hour(utcDate.hour() + 1);
            utcDate.minutes(0);
            PbDtArrRnd[i] = utcDate.toISOString().slice(0,19);
          } else {PbDtArrRnd[i] = utcDate.toISOString().slice(0,19)};
          //PbDtArrRnd[i] = PbDtArr2[i];
          //PbDtArr2[i].setSeconds(0);
        }
        for (let i = 0; i < hourlyDTs.length; i++) {
          let found = false;
          for (let j = 0; j < PbDtArrRnd.length; j++) {
            calcCt += 1;
            if (hourlyDTs[i] === PbDtArrRnd[j]) {
              PbDTArrFull.push(PbDtArrRnd[j]);
              PbFlowArrFull.push(PbFlowArr2[j]);
              found = true;
              break;
            }
          }
          if (!found) {
            PbDTArrFull.push(hourlyDTs[i]);
            PbFlowArrFull.push(0);
          }
        }
        $("#tstStr1").html(JSON.stringify(PbDTArrFull.length));
        // $("#tstStr2").html(JSON.stringify(PbFlowArrFull.length));
        //$("#tstStr1").html(JSON.stringify(hourlyDTs.slice(0,4)));
        //$("#").html(JSON.stringify(hourlyDTs.slice(0,10)));
        //$("#tstStr2").html(JSON.stringify(rndPbDtArr2.slice(0,4)));
        for (let i = 0; i < PbDtArr2.length; i++) {
          PbChartArr2[i] = {x:PbDtArr2[i],y:parseInt(PbFlowArr2[i])};
          calcCt += 1;
          }
        ProcedureOne();
        //$("#").html(JSON.stringify(PbDtArr2))
    })
    // .catch(error => {
    //     $("#tstStr1").html((error)); // If there is an error, show it in tstStr3
    // });
  function checkUpdte() {
    if ($("#chart4Div svg g g g g g") == null | $("#chart3Div svg g g g g g") == null | $("#chart2Div svg g g g g g") == null | $("#chart1Div svg g g g g g") == null) {
      setTimeout(function() {checkUpdte()},200);
    } else {
      setTimeout(function() {
        $("#chart3Div").hide();
        $("#chart4Div").hide();
      },5000);
    }
  }
  // checkUpdte();
  $("#btn1").click(function() {
    if ($("#btn1").text()=="30 day") {
      $("#btn1").text("7 day");
      $("#chartDiv").css("transform","translate(100%)");  $("#chartDiv").css("position","absolute");
      $("#chart2Div").css("transform","translate(100%)"); $("#chart2Div").css("position","absolute");
      $("#chart3Div").css("transform","translate(-50%)"); $("#chart3Div").css("position","static");
      $("#chart4Div").css("transform","translate(-50%)"); $("#chart4Div").css("position","static");
    } else if ($("#btn1").text()=="7 day") {
      $("#btn1").text("30 day");
      $("#chartDiv").css("transform","translate(-50%)");  $("#chartDiv").css("position","static");
      $("#chart2Div").css("transform","translate(-50%)"); $("#chart2Div").css("position","static");
      $("#chart3Div").css("transform","translate(100%)"); $("#chart3Div").css("position","absolute");
      $("#chart4Div").css("transform","translate(100%)"); $("#chart4Div").css("position","absolute");
    };
  });
  // $("#btn1").click(function() {
  //   if ($("#btn1").text()=="30 day") {
  //     $("#btn1").text("7 day");
  //     $("#chartDiv").hide()
  //     $("#chart2Div").hide()
  //     $("#chart3Div").show()
  //     $("#chart4Div").show()
  //   } else if ($("#btn1").text()=="7 day") {
  //     $("#btn1").text("30 day")
  //     $("#chartDiv").show()
  //     $("#chart2Div").show()
  //     $("#chart3Div").hide()
  //     $("#chart4Div").hide()
  //   };
  // });
  var chkJuan = 0
  var vWidth = $(window).width();
  $("#weatherLink").click(function() {
    if (chkJuan == 0) {
      $("#mainCont").css("transition","1.7s")
      //$("#mainCont").css("position","absolute")
      chkJuan = 1
      $("#mainCont").css("transform","translate(100%)")
      $("body").addClass("bodyWthr");$("body").css("transition","1s")
      $("#weatherCont").css("transition","1s 0.5s");$("#weatherCont").css("transform","translate(-50%)");

    } else {
      chkJuan = 0
      $("#mainCont").css("transition","0.8s")
      $("#mainCont").css("position","static")
      $("#mainCont").css("transform","translate(-50%)")
      $("body").removeClass("bodyWthr");$("body").css("transition","1s")
      $("#weatherCont").css("transition","0.5s");$("#weatherCont").css("position","absolute"); $("#weatherCont").css("transform","translate(-180%)")
    };
    //Previous jQuery animations replaces with css
    // $("#tstStr").html($("#mainCont").is(":visible"))
    // if ($("#mainCont").is(":visible") == true) {
    //   //$("#mainCont").hide()
    //   $("#mainCont").css("position","relative")
    //   $("#mainCont").animate({
    //       left: "+="+vWidth,
    //     }, 1000);
    // } else {
    //   $("#mainCont").show()
    // };
  });
  $("#riverLink").click(function() {
    //$("#mainCont").addClass("fly")
    // $("#tstStr").html($("#mainCont").is(":visible"))
    // if ($("#mainCont").is(":visible") == false) {
    //   //$("#mainCont").hide()
    //   $("#mainCont").css("position","relative")
    //   $("#mainCont").animate({
    //       left: "+="+vWidth,
    //     }, 1000);
    // } else {
    //   $("#mainCont").show()
    // };
  });
  //$("#tstStr2").html('shitting?')  <--- GO TO TESTING STRINGS !!-->
  //$("#tstStr3").html('ye')
  // //Prep DB Connection and Begin Testing
  // fetch("McKayDBpull.php")
  //   .then(response => response.json())
  //   .then(data => {
  //       //$("#tstStr3").html(JSON.stringify(data))
  //       PbDtArr2 = data.map(a => a.DateTime)
  //       PbFlowArr2 = data.map(a => a.CFS)
  //       var PbChartArr2 = [];
  //       for (let i = 0; i < PbDtArr2.length; i++) {
  //         PbChartArr2[i] = {x:PbDtArr2[i],y:parseInt(PbFlowArr2[i])};
  //         }
  //       $("#tstStr3").html(JSON.stringify(PbChartArr2))
  //   })
  //   .catch(error => {
  //       $("#tstStr3").html((error)); // If there is an error, show it in tstStr3
  //   });
});
$(window).load(function() {
});

// CODE GRAVEYARD & SBX REPO //


// $("#desc1").mouseenter(function(){
// 	$("#desc1 h1").stop().animate({color:"#09F"}, 170);
// 	});
// $("#desc1").mouseleave(function(){
// 	$("#desc1 h1").stop().animate({color:"#FFF"}, 170);
// 	});


//code to covert local data with datetimes to UTC

// for (let i = 0; i < 30*24; i++) {
//   let datetime = new Date(thirtyDaysAgo.getTime() + i*60*60*1000);
//   datetime.setMinutes(0);
//   datetime.setSeconds(0);
//   hourlyDTs.push(datetime.toISOString().slice(0,19))};
//   rndPbDtArr2 = PbDtArr2.map(datetime => {
//     let date = new Date(datetime);
//     let hours = date.getHours();
//     date.setHours(hours + Math.round(date.getMinutes()/60));
//     date.setMinutes(0);
//     date.setSeconds(0);
//     return date.toISOString().slice(0, 16);});
// for (let i = 0; i < hourlyDTs.length; i++) {
//   let found = false;
//   for (let j = 0; j < rndPbDtArr2.length; j++) {
//     if (hourlyDTs[i] = rndPbDtArr2[j]) {
//       PbFlowArrFull.push(PbFlowArr2[j]);
//       found = true;
//       break;
//     }
//   }
//   if (!found) {
//     PbFlowArrFull.push(0)
//   }
// }
// dte47 = new Date('2022-06-14T12:00:00')
// dte48 = moment.tz(dte47, 'America/New_York');
// let utcDate = dte48.clone().utc();
//let dteTest1 = new Date(Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York' }).format(dte47));
