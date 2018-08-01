// ==UserScript==
// @name         BugMeNot Everywhere
// @namespace    https://greasyfork.org/users/37096/
// @homepage     https://greasyfork.org/scripts/35957/
// @supportURL   https://greasyfork.org/scripts/35957/feedback
// @version      1.1.0
// @description  Add a list of login accounts from BugMeNot ( bugmenot.com ) on any website when focusing on username input
// @author       Hồng Minh Tâm
// @icon         http://bugmenot.com/favicon.ico
// @include      *
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @license      GPL-3.0
// ==/UserScript==

(function () {
  'use strict';
  GM_addStyle([
    '.bmn-list { display:none; list-style: none; border: 1px solid #ccc; padding: 0; margin: 0; background-color: #fff; position: fixed; cursor: default; z-index: 9999999999; box-sizing: border-box; overflow: auto; text-align: left; }',
    '.bmn-list.show { display:block; }',
    '.bmn-list .bmn-row { position: relative; margin: 0 5px 5px 5px; display: -ms-flexbox; display: -webkit-flex; display: flex; }',
    '.bmn-list .bmn-row:last-child { margin-bottom: 0; }',
    '.bmn-list .bmn-col { position: relative; display: -ms-flexbox; display: -webkit-flex; display: flex; -webkit-flex-direction: column; -ms-flex-direction: column; flex-direction: column; }',
    '.bmn-list .bmn-full { -webkit-flex: 1 0 auto; -ms-flex: 1 0 auto; flex: 1 0 auto; }',
    '.bmn-list .bmn-align-items-center { -webkit-align-items: center; -ms-flex-align: center; align-items: center; }',
    '.bmn-list .bmn-align-self-center { -webkit-align-self: center; -ms-flex-item-align: center; align-self: center; }',
    '.bmn-list .bmn-justify-content-center { -webkit-justify-content: center; -ms-flex-pack: center; justify-content: center; }',
    '.bmn-list .bmn-item { position: relative; padding: 5px 2px 5px 7px; margin: 0; cursor: pointer; border-bottom: 1px solid rgba(0,0,0,.125); color: #495057; }',
    '.bmn-list .bmn-item:last-child { border-bottom: 0; }',
    '.bmn-list .bmn-item:hover { background-color: #f8f9fa; }',
    '.bmn-list .bmn-item:before { position: absolute; content: ""; width: 5px; top: 0; left: 0; bottom: 0; background-color: #f7704f; }',
    '.bmn-list .bmn-item .bmn-icon { padding: 5px; background-color: #e9ecef; border: 1px solid #ced4da; }',
    '.bmn-list .bmn-item .bmn-username { margin-left: 10px; font-weight: 700; }',
    '.bmn-list .bmn-item .bmn-password { margin-left: 10px; color: #666; }',
    '.bmn-list .bmn-item .bmn-success { display: inline-block; font-weight: 700; }',
    '.bmn-list .bmn-item.bmn-success-100 .bmn-success { color: rgb(0,198,0); }',
    '.bmn-list .bmn-item.bmn-success-100:before { background-color: rgb(0,198,0); }',
    '.bmn-list .bmn-item.bmn-success-90 .bmn-success { color: rgb(50,180,0); }',
    '.bmn-list .bmn-item.bmn-success-90:before { background-color: rgb(50,180,0); }',
    '.bmn-list .bmn-item.bmn-success-80 .bmn-success { color: rgb(99,164,0); }',
    '.bmn-list .bmn-item.bmn-success-80:before { background-color: rgb(99,164,0); }',
    '.bmn-list .bmn-item.bmn-success-70 .bmn-success { color: rgb(149,146,0); }',
    '.bmn-list .bmn-item.bmn-success-70:before { background-color: rgb(149,146,0); }',
    '.bmn-list .bmn-item.bmn-success-60 .bmn-success { color: rgb(199,129,0); }',
    '.bmn-list .bmn-item.bmn-success-60:before { background-color: rgb(199,129,0); }',
    '.bmn-list .bmn-item.bmn-success-50 .bmn-success { color: rgb(247,112,0); }',
    '.bmn-list .bmn-item.bmn-success-50:before { background-color: rgb(247,112,0); }',
    '.bmn-list .bmn-item.bmn-success-40 .bmn-success { color: rgb(247,90,0); }',
    '.bmn-list .bmn-item.bmn-success-40:before { background-color: rgb(247,90,0); }',
    '.bmn-list .bmn-item.bmn-success-30 .bmn-success { color: rgb(247,67,0); }',
    '.bmn-list .bmn-item.bmn-success-30:before { background-color: rgb(247,67,0); }',
    '.bmn-list .bmn-item.bmn-success-20 .bmn-success { color: rgb(247,45,0); }',
    '.bmn-list .bmn-item.bmn-success-20:before { background-color: rgb(247,45,0); }',
    '.bmn-list .bmn-item.bmn-success-10 .bmn-success { color: rgb(247,22,0); }',
    '.bmn-list .bmn-item.bmn-success-10:before { background-color: rgb(247,22,0); }',
    '.bmn-list .bmn-item .bmn-vote { display: inline-block; margin-left: 16px; float: right; }',
    '.bmn-list .bmn-no-logins-found { padding: 5px 10px; margin: 0; cursor: default; text-align: center; background-color: #a90000; color: #fff; }',
  ].join(''));

  Object.defineProperty(String.prototype, 'toDOM', {
    value: function (isFull) {
      var parser = new DOMParser(),
        dom = parser.parseFromString(this, 'text/html');
      return isFull ? dom : dom.body.childNodes[0];
    },
    enumerable: false
  });

  function setValueInput(input, value, isInputSimulate) {
    var setValue = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setValue.call(input, value);
    if (isInputSimulate) {
      var e = new Event('input', {
        bubbles: true
      });
      input.dispatchEvent(e);
    }
  }

  function getOffset(element) {
    var elementRect = element.getBoundingClientRect();
    return {
      left: elementRect.left,
      right: elementRect.right,
      top: elementRect.top,
      bottom: elementRect.bottom,
    };
  }

  function handleEvent(func, data) {
    return function (event) {
      func.bind(this)(event, data);
    };
  }

  function getIcons8(style, id, size, color) {
    return 'https://png.icons8.com/' + style + '/' + size + '/' + color + '/' + id + '.png';
  }

  var accounts = [];
  var inputUsernameCurrentEl, inputPasswordCurrentEl;
  var minHeightListBMN = 100;

  GM_xmlhttpRequest({
    method: 'GET',
    url: 'http://bugmenot.com/view/' + location.hostname,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    onload: function (response) {
      var bmnEl = response.responseText.toDOM(true);
      var accountEls = bmnEl.getElementsByClassName('account');
      for (var i = 0; i < accountEls.length; i++) {
        var accountEl = accountEls[i];
        var infoEl = accountEl.getElementsByTagName('kbd');
        var statsEl = accountEl.getElementsByClassName('stats')[1].getElementsByTagName('li');
        var account = {
          username: infoEl[0].innerHTML || '',
          password: infoEl[1].innerHTML || '',
          success: parseInt(statsEl[0].innerHTML.match(/\d+(?=%)/)[0]),
          vote: parseInt(statsEl[1].innerHTML.match(/\d+(?=\svotes)/)[0]),
          time: statsEl[2].innerHTML
        };
        accounts.push(account);
      }
      init();
    },
    onerror: function (response) {}
  });

  function init() {
    var listBMNEl = document.createElement('ul');
    listBMNEl.classList.add('bmn-list');
    document.body.appendChild(listBMNEl);

    function showListBMNEl() {
      listBMNEl.classList.add('show');
    }

    function hideListBMNEl() {
      listBMNEl.classList.remove('show');
    }

    if (accounts.length) {
      accounts.forEach(function (account, index) {
        var itemBMNEl = document.createElement('li');
        itemBMNEl.classList.add('bmn-item');
        itemBMNEl.classList.add(getClassSuccess(account.success));
        var itemBMNElHTML = [
          '<div class="bmn-row">',
          '  <div class="bmn-col bmn-full">',
          '    <div class="bmn-row bmn-align-items-center">',
          '      <img class="bmn-icon" src="' + getIcons8('material', 'user', 20, '495057') + '" />',
          '      <span class="bmn-username">' + account.username + '</span>',
          '    </div>',
          '    <div class="bmn-row bmn-align-items-center">',
          '      <img class="bmn-icon" src="' + getIcons8('material', 'password1', 20, '495057') + '" />',
          '      <span class="bmn-password">' + account.password + '</span>',
          '    </div>',
          '  </div>',
          '  <div class="bmn-col bmn-align-self-center">',
          '    <div class="bmn-success">' + account.success + '%</div>',
          '  </div>',
          '</div>',
          '<div class="bmn-row">',
          '  <div class="bmn-vote">' + account.vote + ' votes</div>',
          '</div>',
          // ',<div class="time">' + account.time + '</div>',
        ].join('');
        itemBMNEl.innerHTML = itemBMNElHTML;
        itemBMNEl.title = [
          'Username: ' + account.username,
          'Password: ' + account.password,
          '',
          account.success + '% success rate',
          account.vote + ' votes',
          account.time
        ].join('\n');
        itemBMNEl.onmousedown = handleEvent(onMouseDownItem);
        itemBMNEl.onclick = handleEvent(onClickItem, account);
        itemBMNEl.onmouseover = handleEvent(onMouseOverItem, account);
        itemBMNEl.onmouseout = handleEvent(onMouseOutItem);
        listBMNEl.appendChild(itemBMNEl);
      });
    } else {
      var itemBMNNoLoginsFoundEl = document.createElement('li');
      itemBMNNoLoginsFoundEl.classList.add('bmn-no-logins-found');
      itemBMNNoLoginsFoundEl.innerHTML = 'No logins found';
      listBMNEl.appendChild(itemBMNNoLoginsFoundEl);
    }

    window.onscroll = function (event) {
      if (inputUsernameCurrentEl) {
        addStyleListBMNEl(inputUsernameCurrentEl);
      }
    };

    window.onresize = function (event) {
      if (inputUsernameCurrentEl) {
        addStyleListBMNEl(inputUsernameCurrentEl);
      }
    };

    var enableMouseOut = true;

    function setValueInputItem(inputUsernameEl, inputPasswordEl, username, password, isInputSimulate) {
      // inputUsernameEl.value = username;
      // inputPasswordEl.value = password;
      setValueInput(inputUsernameEl, username, isInputSimulate);
      setValueInput(inputPasswordEl, password, isInputSimulate);
    }

    function onMouseDownItem(event) {
      event.preventDefault();
    }

    function onClickItem(event, account) {
      event.stopPropagation();
      enableMouseOut = false;
      if (inputUsernameCurrentEl && inputPasswordCurrentEl) {
        setValueInputItem(inputUsernameCurrentEl, inputPasswordCurrentEl, account.username, account.password, true);
        inputUsernameCurrentEl.setAttribute('value', account.username);
        hideListBMNEl();
      }
    }

    function onMouseOverItem(event, account) {
      if (inputUsernameCurrentEl && inputPasswordCurrentEl) {
        setValueInputItem(inputUsernameCurrentEl, inputPasswordCurrentEl, account.username, account.password);
      }
    }

    function onMouseOutItem(event) {
      if (!enableMouseOut) {
        enableMouseOut = true;
        return;
      }
      if (inputUsernameCurrentEl && inputPasswordCurrentEl) {
        setValueInputItem(inputUsernameCurrentEl, inputPasswordCurrentEl, '', '');
      }
    }

    function getClassSuccess(success) {
      if (success > 91) return 'bmn-success-100';
      else if (success > 81) return 'bmn-success-90';
      else if (success > 71) return 'bmn-success-80';
      else if (success > 61) return 'bmn-success-70';
      else if (success > 51) return 'bmn-success-60';
      else if (success > 31) return 'bmn-success-50';
      else if (success > 21) return 'bmn-success-30';
      else if (success > 11) return 'bmn-success-20';
      else return 'bmn-success-10';
    }

    function addStyleListBMNEl(inputEl) {
      listBMNEl.style.width = inputEl.offsetWidth + 'px';
      var offsetTarget = getOffset(inputEl);
      var windowHeight = document.documentElement.clientHeight;
      if (offsetTarget.top >= minHeightListBMN) {
        listBMNEl.style.bottom = (windowHeight - offsetTarget.top) + 'px';
        listBMNEl.style.top = '';
        listBMNEl.style.left = offsetTarget.left + 'px';
        listBMNEl.style.maxHeight = offsetTarget.top + 'px';
      } else {
        listBMNEl.style.top = offsetTarget.bottom + 'px';
        listBMNEl.style.bottom = '';
        listBMNEl.style.left = offsetTarget.left + 'px';
        listBMNEl.style.maxHeight = (windowHeight - offsetTarget.bottom) + 'px';
      }
    }

    function onFocusInput(event, data) {
      inputUsernameCurrentEl = data.inputUsernameEl;
      inputPasswordCurrentEl = data.inputPasswordEl;
      addStyleListBMNEl(inputUsernameCurrentEl);
      showListBMNEl();
    }

    function onBlurInput(event) {
      if (!event.target.isSameNode(document.activeElement)) {
        hideListBMNEl();
      }
    }

    function onInputInput(event) {
      enableMouseOut = false;
      hideListBMNEl();
    }

    function checkAndEventToInput() {
      var inputEls = document.querySelectorAll('input:not([type]):not([data-bmn-checked="true"]), input[type=text]:not([data-bmn-checked="true"]), input[type=email]:not([data-bmn-checked="true"]), input[type=tel]:not([data-bmn-checked="true"]), input[type=password]:not([data-bmn-checked="true"])');
      if (inputEls.length > 1) {
        for (var i = 1; i < inputEls.length; i++) {
          inputEls[i].dataset.bmnChecked = true;
          if (inputEls[i].type === 'password') {
            if ((inputEls[i + 1] && inputEls[i + 1].type === 'password')) {
              continue;
            }

            if (inputEls[i - 1]) {
              if (inputEls[i - 1].type === 'password') {
                continue;
              } else {
                var inputUsernameEl = inputEls[i - 1];
                var inputPasswordEl = inputEls[i];
                var data = {
                  inputUsernameEl: inputUsernameEl,
                  inputPasswordEl: inputPasswordEl
                };
                inputUsernameEl.onclick = handleEvent(onFocusInput, data);
                inputUsernameEl.onfocus = handleEvent(onFocusInput, data);
                inputUsernameEl.onblur = handleEvent(onBlurInput);
                inputUsernameEl.oninput = handleEvent(onInputInput);
                if (inputUsernameEl.isSameNode(document.activeElement)) onFocusInput(undefined, data);
              }
            }
          }
        }
      }
    }

    var observeDOM = (function () {
      var MutationObserver = window.MutationObserver || window.WebKitMutationObserver,
        eventListenerSupported = window.addEventListener;

      return function (obj, callback) {
        if (MutationObserver) {
          var obs = new MutationObserver(function (mutations, observer) {
            if (mutations[0].addedNodes.length || mutations[0].removedNodes.length) {
              callback();
            }
          });
          obs.observe(obj, {
            childList: true,
            subtree: true
          });
        } else if (eventListenerSupported) {
          obj.addEventListener('DOMNodeInserted', callback, false);
          obj.addEventListener('DOMNodeRemoved', callback, false);
        }
      };
    })();

    observeDOM(document, function () {
      checkAndEventToInput();
    });
  }
})();