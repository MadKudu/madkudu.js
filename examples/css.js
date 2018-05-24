console.log('v4.2')

var load_style = function () {
  console.log('load_style')
  // see here for explanations: http://jonraasch.com/blog/javascript-style-node
  var css = document.createElement('style')
  css.type = 'text/css'
  var styles = `
  .madkudu_modal__overlay {
      background: #3c97da;
      opacity: 0.9;
  }
  .madkudu_modal__box {
      top: 17rem;
      max-width: 30rem;
      padding-bottom: 1rem;
  }
  button.madkudu_modal__accept {
      background: #245376;
      border: 1px solid #245376;
  }
  button.madkudu_modal__accept:hover {
      background: #2E6A97;
      border-color: #245376;
  }
  .madkudu_modal__cancel {
      color: #eee;
      text-decoration: none;
      font-size: 0.75rem;
      background-color: transparent;
  }
  button.madkudu_modal__cancel:hover {
      background-color: transparent;
      border-color: transparent;
      text-decoration: underline;
      color: white;
  }
  .madkudu_modal__title {
      font-size: 2.441rem;
      line-height: 1.33;
      padding-bottom: 0.5rem;
      text-transform: none;
      letter-spacing: 0px;
      font-family: "Roboto Slab", "Open Sans", sans-serif;
      font-weight: 400;
  }
  .madkudu_modal__subtitle {
      font-size: 1rem;
      line-height: 1.667;
      padding: 0 40px 40px;
  }
  `

  console.log(styles)

  if (css.styleSheet) css.styleSheet.cssText = styles
  else css.appendChild(document.createTextNode(styles))
  document.getElementsByTagName('head')[0].appendChild(css)
}

load_style()
