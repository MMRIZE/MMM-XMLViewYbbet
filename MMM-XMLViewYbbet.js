Module.register("MMM-XMLViewYbbet", {
  defaults: {
    xmlURL: "./modules/MMM-XMLViewYbbet/example.xml",
    itemLife: 1000 * 5,
    scanInterval: 1000 * 60 * 60,
  },

  start: function () {
    this.scanTimer = null
    this.drawTimer = null
    this.items = []
    this.currentItem = {}
    this.index = 0
  },

  getDom: function () {
    let dom = document.createElement('div')

    if (this.currentItem) {
      if (this.currentItem?.title) {
        let t = document.createElement('div')
        t.classList.add('title')
        t.innerHTML = this.currentItem.title
        dom.appendChild(t)
      }
      if (this.currentItem?.image) {
        let t = document.createElement('img')
        t.classList.add('image')
        t.src = this.currentItem.image
        dom.appendChild(t)
      }
      if (this.currentItem?.description) {
        let t = document.createElement('div')
        t.classList.add('description')
        t.innerHTML = this.currentItem.description
        dom.appendChild(t)
      }
    }
    return dom
  },

  notificationReceived: function (notification, payload, sender) {
    if (notification === 'DOM_OBJECTS_CREATED') this.scan();
  },

  scan: function () {
    if (this.scanTimer) {
      clearTimeout(this.scanTimer)
      this.scanTimer = null
    }
    let xhttp = new XMLHttpRequest()
    let self = this
    xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        let data = []
        xmlDoc = xhttp.responseXML
        console.log(xmlDoc)
        const items = xmlDoc.getElementsByTagName('item')
        for (i = 0; i < items.length; i++) {
          let image = items[ i ].getElementsByTagName('image')?.[ 0 ].textContent ?? null
          let title = items[ i ].getElementsByTagName('title')?.[ 0 ].textContent ?? null
          let description = items[ i ].getElementsByTagName('description')?.[ 0 ].textContent ?? null
          if (image || title || description) data.push({ title, image, description })
        }
        if (data.length > 0) {
          Log.log(`Scanned ${data.length} items`)
          self.items = data
          self.index = 0
          self.draw()
        }
      }
    }
    xhttp.open("GET", this.config.xmlURL, true)
    xhttp.send()

    this.scanTimer = setTimeout(() => {
      this.scan()
    }, this.config.scanInterval)
  },

  draw: function () {
    if (this.data.length < 1) {
      Log.warn('There is no item to draw')
      return
    }
    if (this.drawTimer) {
      clearTimeout(this.drawTimer)
      this.drawTimer = null
    }
    this.currentItem = this.items[ this.index++ ]
    if (this.index >= this.items.length) this.index = 0
    this.updateDom()
    this.drawTimer = setTimeout(() => {
      this.draw()
    }, this.config.itemLife)
  }
})
