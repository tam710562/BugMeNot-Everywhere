// ==UserScript==
// @name         BugMeNot Everywhere
// @namespace    https://greasyfork.org/users/37096/
// @homepage     https://greasyfork.org/scripts/35957/
// @supportURL   https://greasyfork.org/scripts/35957/feedback
// @version      1.0.5
// @description  Add a list of login accounts from BugMeNot ( bugmenot.com ) on any website when focusing on username input
// @author       Hồng Minh Tâm
// @icon         http://bugmenot.com/favicon.ico
// @include      *
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @license      GNU GPLv3
// ==/UserScript==

(function () {
    'use strict';
    GM_addStyle([
        '@import url(//maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css);',
        '.bmn-list { display:none; list-style: none; border: 1px solid #ccc; padding: 0; margin: 0; background-color: #fff; position: fixed; cursor: default; z-index: 9999999999; box-sizing: border-box; overflow: auto; text-align: left; }',
        '.bmn-list.show { display:block; }',
        '.bmn-list .bmn-item { padding: 5px 10px; margin: 0; cursor: pointer; border-bottom: 1px solid #aaa; color: #333; }',
        '.bmn-list .bmn-item:last-child { border-bottom: 0; }',
        '.bmn-list .bmn-item:hover { background-color: #ddd; }',
        '.bmn-list .bmn-item .bmn-username { font-weight: 700; margin-bottom: 4px; }',
        '.bmn-list .bmn-item .bmn-password { margin-bottom: 4px; color: #666; }',
        '.bmn-list .bmn-item .bmn-success { display: inline-block; font-weight: 700; }',
        '.bmn-list .bmn-item .bmn-success.bmn-success-100 { color: rgb(0,198,0); }',
        '.bmn-list .bmn-item .bmn-success.bmn-success-90 { color: rgb(50,180,0); }',
        '.bmn-list .bmn-item .bmn-success.bmn-success-80 { color: rgb(99,164,0); }',
        '.bmn-list .bmn-item .bmn-success.bmn-success-70 { color: rgb(149,146,0); }',
        '.bmn-list .bmn-item .bmn-success.bmn-success-60 { color: rgb(199,129,0); }',
        '.bmn-list .bmn-item .bmn-success.bmn-success-50 { color: rgb(247,112,0); }',
        '.bmn-list .bmn-item .bmn-success.bmn-success-40 { color: rgb(247,90,0); }',
        '.bmn-list .bmn-item .bmn-success.bmn-success-30 { color: rgb(247,67,0); }',
        '.bmn-list .bmn-item .bmn-success.bmn-success-20 { color: rgb(247,45,0); }',
        '.bmn-list .bmn-item .bmn-success.bmn-success-10 { color: rgb(247,22,0); }',
        '.bmn-list .bmn-item .bmn-vote { display: inline-block; margin-left: 16px; float: right; }',
        '.bmn-list .bmn-no-logins-found { padding: 5px 10px; margin: 0; cursor: default; text-align: center; background-color: #a90000; color: #fff; }',
    ].join(''));

    String.prototype.toDOM = function (isFull) {
        var parser = new DOMParser(),
            dom = parser.parseFromString(this, 'text/html');
        return isFull ? dom : dom.body.childNodes[0];
    };

    function getOffset(element, noScroll) {
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
                var itemBMNElHTML = [
                    '<div>',
                    '    <i class="fa fa-user fa-fw"></i>',
                    '    <span class="bmn-username">' + account.username + '</span>',
                    '</div>',
                    '<div>',
                    '    <i class="fa fa-key fa-fw"></i>',
                    '    <span class="bmn-password">' + account.password + '</span>',
                    '</div>',
                    '<div>',
                    '    <div class="bmn-success ' + getClassSuccess(account.success) + '">' + account.success + '%</div>',
                    '    <div class="bmn-vote">' + account.vote + ' votes</div>',
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

        function setValueInput(inputUsernameEl, inputPasswordEl, username, password) {
            inputUsernameEl.value = username;
            inputPasswordEl.value = password;
        }

        function onMouseDownItem(event) {
            event.preventDefault();
        }

        function onClickItem(event, account) {
            enableMouseOut = false;
            if (inputUsernameCurrentEl && inputPasswordCurrentEl) {
                setValueInput(inputUsernameCurrentEl, inputPasswordCurrentEl, account.username, account.password);
                hideListBMNEl();
            }
        }

        function onMouseOverItem(event, account) {
            if (inputUsernameCurrentEl && inputPasswordCurrentEl) {
                setValueInput(inputUsernameCurrentEl, inputPasswordCurrentEl, account.username, account.password);
            }
        }

        function onMouseOutItem(event) {
            if (!enableMouseOut) {
                enableMouseOut = true;
                return;
            }
            if (inputUsernameCurrentEl && inputPasswordCurrentEl) {
                setValueInput(inputUsernameCurrentEl, inputPasswordCurrentEl, '', '');
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

        function getInputEls() {
            var inputEls = [];
            var inputElTemps = document.getElementsByTagName('input');
            var inputElTemp;
            for (var i = 0; i < inputElTemps.length; i++) {
                inputElTemp = inputElTemps[i];
                switch (inputElTemp.type) {
                    case "text":
                    case "email":
                    case "tel":
                    case "password":
                        inputEls.push(inputElTemp);
                        break;
                }
            }
            return inputEls;
        }

        var inputEls = getInputEls();
        for (var i = 0; i < inputEls.length; i++) {
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
})();
