var vatenData = {}
var reloadVatenInterval = ""
var reloadLogboekInterval = ""

window.addEventListener("load", function () {
    console.log("app ready");
    toonVatenScherm()
})

function toonVatenScherm() {
    appContainer = document.getElementById("appContainer")
    showVaten(appContainer)
}

function toonLogboekScherm() {
    appContainer = document.getElementById("appContainer")
    appContainer.innerHTML = createHeader("Overzicht vaten", "header")
    appContainer.innerHTML += createPreloader("preloader1")
    showLogboek(appContainer)
}

async function showVaten(appContainer) {
    try {
        appContainer.innerHTML = createHeader("Overzicht vaten", "header")
        appContainer.innerHTML += createPreloader("preloader1")
        const response = await loadData("http://192.168.137.10:8050/api/getVatenData.php")
        removeEl(document.getElementById("preloader1"))
        response.forEach(vat => {
            appContainer.innerHTML += createVatCard("vat" + vat["vat_id"], vat)
        })

        actieveVaten = document.getElementsByClassName("activeVatCard")
        for (i = 0; i < actieveVaten.length; i++) {
            (function () {
                var element = actieveVaten[i]
                element.addEventListener("click", function () { showLogboek(appContainer, element.dataset.logboekid) })
            }())
        }
        reloadVatenInterval = setInterval(function() {reloadVaten(appContainer)}, 5000)
    } catch (err) {
        console.error(err)
    }
}

async function reloadVaten(appContainer) {
    try {
        const response = await loadData("http://192.168.0.18:84/live-overzicht/getVatenData.php")
        appContainer.innerHTML = createHeader("Overzicht vaten", "header")
        response.forEach(vat => {
            appContainer.innerHTML += createVatCard("vat" + vat["vat_id"], vat)
        })

        actieveVaten = document.getElementsByClassName("activeVatCard")
        for (i = 0; i < actieveVaten.length; i++) {
            (function () {
                var element = actieveVaten[i]
                element.addEventListener("click", function () { showLogboek(appContainer, element.dataset.logboekid) })
            }())
        }
    } catch (err) {
        console.error(err)
    }
}

async function showLogboek(appContainer, logboekId) {
    try {
        clearInterval(reloadVatenInterval);
        appContainer.innerHTML = createHeader("Logboek", "header")
        appContainer.innerHTML += createButton("toHomeButton", "Ga naar overzicht")
        appContainer.innerHTML += createButton("stopFermentatie", "Stop fermentatie")
        appContainer.innerHTML += createPreloader("preloader1")
        document.getElementById("toHomeButton").addEventListener("click", function() { 
            clearInterval(reloadLogboekInterval)
            showVaten(appContainer) 
        })
        document.getElementById("stopFermentatie").addEventListener("click", function() { stopFermentatie()})
        var params = new FormData;
        params.append("logboekId", logboekId)
        const response = await loadData("http://192.168.0.18:84/live-overzicht/getLogboekData.php", params)
        reloadLogboekInterval = setInterval(function() {reloadLogboek(appContainer, logboekId)}, 5000)
        var xTijd, yTemp, yEthanol, yCO2
        removeEl(document.getElementById("preloader1"))
        response.metingen.forEach(sensor => {
            var metingen = Object.values(sensor.metingen)
            var tijdstippen = Object.keys(sensor.metingen)
            switch(sensor.naam) {
                case "temp":
                    yTemp = metingen
                    break;
                case "ethanol":
                    yEthanol = metingen
                    break;
                case "co2":
                    yCO2 = metingen
                    break;
                default:
                    console.warn(sensor.naam + " kwam niet voor in switch statement");
            }
            xTijd = tijdstippen
            appContainer.innerHTML += createKpi(
                "sensor-" + sensor.sensor_id,
                metingen[metingen.length - 1],
                sensor.naam,
                sensor.eenheid
            )
        })
        tijdbezig = Math.round((new Date - new Date(response.logboek.aanmaak_datum)) / 1000 / 60 / 60)
        console.log(tijdbezig);
        
        appContainer.innerHTML += createKpi("kpi-duur", tijdbezig, "Tijd bezig", "u")
        appContainer.appendChild(createGraph("grafiek1", xTijd, yTemp, yEthanol, yCO2))
        document.getElementById("toHomeButton").addEventListener("click", function() { 
            clearInterval(reloadLogboekInterval);
            showVaten(appContainer) 
        })
        document.getElementById("stopFermentatie").addEventListener("click", function() { stopFermentatie(appContainer, 1, logboekId)})
    } catch (err) {
        console.error(err)
    }
}

async function reloadLogboek(appContainer, logboekId) {
    kpiEls = document.getElementsByClassName("kpi-container")
    graphEls = document.getElementsByClassName("graph-container")
    var params = new FormData;
    params.append("logboekId", logboekId)
    const response = await loadData("http://192.168.0.18:84/live-overzicht/getLogboekData.php", params)
    var xTijd, yTemp, yEthanol, yCO2
    response.metingen.forEach(sensor => {
        var metingen = Object.values(sensor.metingen)
        var tijdstippen = Object.keys(sensor.metingen)
        switch(sensor.naam) {
            case "temp":
                yTemp = metingen
                break;
            case "ethanol":
                yEthanol = metingen
                break;
            case "co2":
                yCO2 = metingen
                break;
            default:
                console.warn(sensor.naam + " kwam niet voor in switch statement");
        }
        xTijd = tijdstippen
        for (let i = 0; i < kpiEls.length; i++) {
            if("sensor-" + sensor.sensor_id == kpiEls[i].id) {
                kpiEls[i].children[0].children[1].innerHTML = metingen[metingen.length - 1] + " " + sensor.eenheid
            }                 
        }
        removeEl(document.getElementById("grafiek1"))
        appContainer.appendChild(createGraph("grafiek1", xTijd, yTemp, yEthanol, yCO2))
    })  
}

function loadData(url, params = null) {
    return new Promise((resolve, reject) => {
        var xmlhttp = new XMLHttpRequest()
        xmlhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                var response = this.responseText;
                response = JSON.parse(response)
                if (response["status"] == "succes") {
                    resolve(response["answer"])

                } else {
                    reject(response["error-message"])
                }
            }
        };
        xmlhttp.open("POST", url, true);
        if (params == null) {
            xmlhttp.send();
        }
        else {
            xmlhttp.send(params)
        }
    })
}

function sendData(url, params = null) {
    return new Promise((resolve, reject) => {
        if(params != null) {
            var xmlhttp = new XMLHttpRequest()
            xmlhttp.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {
                    var response = this.responseText;
                    response = JSON.parse(response)
                    if (response["status"] == "succes") {
                        resolve(response["status"])
                    } else {
                        reject(response["error-message"])
                    }
                }
            };
            xmlhttp.open("POST", url, true);
            xmlhttp.send(params)
        }
    })
}

function removeEl(element) {
    element.parentNode.removeChild(element);
}

async function stopFermentatie(appContainer, vatId, logboekId) {
    try {
        clearInterval(reloadLogboekInterval);
        kpiEls = document.getElementsByClassName("kpi-container")
        graphEls = document.getElementsByClassName("graph-container")
        console.log("Stop fermentatie");
        // remove all data components 
        while (kpiEls.length > 0) {
            removeEl(kpiEls[0])
        }
        while (graphEls.length > 0) {
            removeEl(graphEls[0])
        }
        // create preloader
        appContainer.innerHTML += createPreloader("preloader1")
        var params = new FormData;
        params.append("vatId", vatId)
        params.append("logboekId", logboekId)
        const response = await sendData("http://192.168.0.18:84/live-overzicht/stopFermentatie.php", params)
        console.log(response)
        showVaten(appContainer)
    } catch(err) {
        console.error(err)
        clearInterval(reloadLogboekInterval);
        showLogboek(appContainer, logboekId)
    }
}
