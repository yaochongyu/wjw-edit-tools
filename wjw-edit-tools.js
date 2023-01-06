// ==UserScript==
// @name         wjw-edit-tools
// @namespace    https://github.com/yaochongyu/wjw-edit-tools
// @author       yaochongyu
// @version      1.2.2
// @description  Some tools for https://www.wenjuan.com
// @supportURL   https://github.com/yaochongyu/wjw-edit-tools
// @match        https://www.wenjuan.com/edit/survey/*
// @updateURL    https://gitee.com/yaochongyu/wjw-edit-tools/raw/master/wjw-edit-tools.js
// @downloadURL  https://gitee.com/yaochongyu/wjw-edit-tools/raw/master/wjw-edit-tools.js
// @grant        GM_addStyle
// ==/UserScript==

const quNu = /(?<!\\)\[\s*qu-nu\s*\]/, opNu = /(?<!\\)\[\s*op-nu\s*\]/;

const style =
    "*.wjw-tools{\
    font-family: microsoft;\
    font-size: 17px;\
    margin: 5px;\
    outline-style: none;\
    display: table;\
    border-radius: 5px;\
    border-style: none;\
}\
button.wjw-tools{\
    width: 200px;\
    height: 30px;\
    color:white;\
    background-color:hotpink;\
    cursor: pointer;\
}\
button.wjw-tools:hover{\
    background-color: pink;\
    transform: scale(1.01);\
}\
input.wjw-tools{\
    border: 1px solid #ccc;\
    width: 200px;\
    height: 30px;\
}";

const Elem1 = "<div class = \"wjw-tools box\"><input id=\"text-box1\" class = \"wjw-tools input\"><button \
class = \"wjw-tools button\" id = \"copy-button\">copy</button></div>";

const Elem2 = "<div class = \"wjw-tools box\"><input id=\"text-box2\" class = \"wjw-tools input\"><button \
class = \"wjw-tools button\" id = \"set-answers-button\">set-answers</button></div>";

const Elem3 = "<div class = \"wjw-tools box\"><input id=\"text-box3\" class = \"wjw-tools input\"><button \
class = \"wjw-tools button\" id = \"set-opoints-button\">set-options</button></div>";

const Elem4 = "<div class = \"wjw-tools box\"><input id=\"text-box4\" class = \"wjw-tools input\"><button \
class = \"wjw-tools button\" id = \"set-titles-button\">set-titles</button></div>";

(function () {
    work();
})();

function work() {
    if (webIsOk()) {
        display();
        return;
    }
    setTimeout(work, 10)
}

function webIsOk() {
    return document.getElementsByClassName("background-music child-setting").length > 0;
}

function restart() {
    let flag = false;
    var check = function () { return document.getElementsByClassName("tab-option left-tab-option").length > 0; };
    function work() {
        flag = check();
        if (flag) {
            document.getElementsByClassName("tab-option left-tab-option")[0].click();
            return;
        }
        setTimeout(work, 10);
    }
    work();
}

function getQueNum(elem) {
    let a = elem.getElementsByClassName("q-seq");
    if (a.length == 0) return 0;
    let x = Number(a[0].textContent)
    return isNaN(x) ? 0 : x;
}

function getQueList() {
    let res = [];
    let a = document.getElementsByClassName("q-content");
    for (let i = 0; i < x.length; i++) {
        let elem = a[i], nu = getQueNum(elem);
        if (nu > 0) res[nu - 1] = elem;
    }
    return res;
}

function setAnswer(elem, answer) {
    function format(answer) {
        let a = answer.charCodeAt();
        if ('a'.charCodeAt() <= a && a <= 'z'.charCodeAt()) return a - 'a'.charCodeAt();
        else return a - 'A'.charCodeAt();
    }

    let index = format(answer);
    let b = elem.getElementsByClassName("wj-checkbox__original");

    function isSelected(answer) {
        return b[answer].parentNode.className.indexOf("is-checked") != -1;
    }

    if (isSelected(index)) return;
    else b[index].click();
}

function setAnswers(s, t, answers) {
    let queList = getQueList();
    for (let i = s; i <= t; i++) {
        let x = queList[i - 1];
        setAnswer(x, answers[i - s]);
    }
    restart();
}

function setText(elem, text) {
    elem.dispatchEvent(new Event("focus"));
    elem.textContent = text;
    elem.dispatchEvent(new Event("input"))
    elem.dispatchEvent(new Event("blur"))
}

function setOption(elem, index, text) {
    let a = elem.getElementsByClassName("transition-box")[0].getElementsByClassName("richTextArea")[index - 1];
    setText(a, text);
}

function setTitle(elem, text) {
    let x = elem.getElementsByClassName("richTextArea")[0];
    setText(x, text);
}

function copy(n) {
    for (let i = 1; i <= n; i++) {
        document.getElementsByClassName("question-module draggable-module question-focus")[0].getElementsByClassName("svg-icon wj-tooltip q-operate-icon")[3].click();
    }
    restart();
}

function setOptionsText(s, t, text) {
    function strReslove(text, i, j) {
        let res = text.replace(quNu, String(i)).replace(opNu, String(j));
        res = res.replace("\\[", "[").replace("\\]", "]").replace("\\\\", "\\");
        return res;
    }
    let QueList = getQueList();
    for (let i = s; i <= t; i++) {
        let x = QueList[i - 1];
        for (let j = 1; j <= 4; j++) {
            setOption(x, j, String.fromCharCode("A".charCodeAt() + j - 1) + strReslove(text, i - s + 1, j));
        }
    }
    restart();
}

function setTitles(s, t, text) {
    function strReslove(text, i) {
        return text.replace(quNu, String(i)).replace("\\[", "[").replace("\\]", "]").replace("\\\\", "\\");
    }
    let QueList = getQueList();
    for (let i = s; i <= t; i++) {
        let x = QueList[i - 1];
        setTitle(x, strReslove(text, i - s + 1));
    }
    restart();
}

function click_copyButton() {
    let elem = document.getElementById("text-box1");
    copy(Number(elem.value));
}

function click_setAnswersButton() {
    let str = document.getElementById("text-box2").value;
    let a = str.split(/\s+/), b = "";
    for (let i = 2; i < a.length; i++) b += a[i];
    setAnswers(a[0], a[1], b);
}

function click_setOpointsButton() {
    let str = document.getElementById("text-box3").value;
    let a = str.split(/\s+/), b = "";
    for (let i = 2; i < a.length; i++) b += a[i];
    setOptionsText(a[0], a[1], b);
}

function click_setTitlesButton() {
    let str = document.getElementById("text-box4").value;
    let a = str.split(/\s+/), b = "";
    for (let i = 2; i < a.length; i++) b += a[i];
    setTitles(a[0], a[1], b);
}

function display() {
    GM_addStyle(style);
    document.getElementsByClassName("background-music child-setting")[0].insertAdjacentHTML("afterend", Elem1 + Elem2 + Elem3 + Elem4);
    document.getElementById("copy-button").onclick = click_copyButton;
    document.getElementById("set-answers-button").onclick = click_setAnswersButton;
    document.getElementById("set-opoints-button").onclick = click_setOpointsButton;
    document.getElementById("set-titles-button").onclick = click_setTitlesButton;
}
