function createHeader(titel, id) {
    component = `
    <div class="header-container" id="` + id + `">
        <div class="header">
            <p class="header-text">` + titel + `</p>
        </div>
    </div>`
    return component
}

function createPreloader(id) {
    component = `
    <div class="preloader-container" id="` + id + `">
        <div class="preloader-wrapper active">
            <div class="spinner-layer spinner-blue-only">
                <div class="circle-clipper left">
                    <div class="circle"></div>
                </div>
                <div class="gap-patch">
                    <div class="circle"></div>
                </div>
                <div class="circle-clipper right">
                    <div class="circle"></div>
                </div>
            </div>
        </div>
    </div>`

    return component
}

function createVatCard(id, vatData) {
    tijdBezig = null
    // convert start datum to javascript datetime
    if(vatData.aanmaak_datum != null) {
        vatData.aanmaak_datum = vatData.aanmaak_datum.split(" ")
        vatData.aanmaak_datum = Date.parse(vatData.aanmaak_datum[0] + "T" + vatData.aanmaak_datum[1])
        tijdBezig = Math.floor(Math.abs(vatData.aanmaak_datum - new Date()) / 36e5)
    }
    
    if(vatData.beschikbaar == 0){
        component = `
        <div class="vatCard-container" id="` + id + `">
            <div class="vatCard hoverable activeVatCard" data-logboekid="` + vatData.logboek_id + `">
                <p>` + vatData.label + `</p>
                <p>` + vatData.label + `</p>
            </div>
        </div>`
    } else {
        component = `
        <div class="vatCard-container" id="` + id + `">
            <div class="vatCard blue lighten-2">
                <p>` + vatData.label + `</p>
                <p>` + vatData.label + `</p>
            </div>
        </div>`
    }

    return component
}

function createKpi(id, waarde, titel, eenheid) {
    component = `
        <div class="kpi-container" id="` + id + `">
            <div class="kpi">
                <p class="kpi-titel">` + titel + `</p>
                <p class="kpi-waarde">` + waarde + " " + eenheid + `</p>
            </div>
        </div>`

    return component
}

function createButton(id, buttonText) {
    component = `
    <div class="button-container" id="` + id + `">
        <div class="button hoverable">` + buttonText + `</div>
    </div>`

    return component 
}

function createGraph(id, xTijd, yTemp, yEthanol, yCO2) {
    var graphContainer = document.createElement("div")
    graphContainer.className += "graph-container"
    graphContainer.id = id
    var graphDiv = document.createElement("div")
    graphDiv.className += "graph"
    var ctx = document.createElement("CANVAS")
    ctx.className = "graph-canvas"
    var myLineChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: xTijd,
          datasets: [{ 
              data: yTemp,
              label: "Temp",
              borderColor: "#e02a2a",
              fill: false
            }, { 
              data: yEthanol,
              label: "Ethanol",
              borderColor: "#2a7fe0",
              fill: false
            }, { 
              data: yCO2,
              label: "CO2",
              borderColor: "#3cba9f",
              fill: false
            }
          ]
        },
        options: {
        }
      });
    graphDiv.appendChild(ctx)
    graphContainer.appendChild(graphDiv)
    component = graphContainer

    return component
}