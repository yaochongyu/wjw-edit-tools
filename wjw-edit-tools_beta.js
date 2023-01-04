// ==UserScript==
// @name         wjw-edit-tools
// @namespace    https://github.com/yaochongyu/wjw-edit-tools
// @author       yaochongyu
// @version      1.2.1
// @description  Some tools for https://www.wenjuan.com
// @supportURL   https://github.com/yaochongyu/wjw-edit-tools
// @match        https://www.wenjuan.com/edit/survey/*
// @updateURL    https://gitee.com/yaochongyu/wjw-edit-tools/raw/dev/wjw-edit-tools_beta.js
// @downloadURL  https://gitee.com/yaochongyu/wjw-edit-tools/raw/dev/wjw-edit-tools_beta.js
// ==/UserScript==

var qu_nu = /(?<!\\)\[\s*qu-nu\s*\]/, op_nu = /(?<!\\)\[\s*op-nu\s*\]/;

var style ="<style>\
*.wjw-tools{\
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
}\
</style>";

var Elem1 = "<div class = \"wjw-tools box\"><input id=\"text_box1\" class = \"wjw-tools input\"><button \
class = \"wjw-tools button\" id = \"copy_button\">copy</button></div>";

var Elem2 = "<div class = \"wjw-tools box\"><input id=\"text_box2\" class = \"wjw-tools input\"><button \
class = \"wjw-tools button\" id = \"set_answers_button\">set-answers</button></div>";

var Elem3 = "<div class = \"wjw-tools box\"><input id=\"text_box3\" class = \"wjw-tools input\"><button \
class = \"wjw-tools button\" id = \"set_opoints_button\">set-options</button></div>";

var Elem4 = "<div class = \"wjw-tools box\"><input id=\"text_box4\" class = \"wjw-tools input\"><button \
class = \"wjw-tools button\" id = \"set_titles_button\">set-titles</button></div>";

(function () {
    work();
})();

function work() {
    if (check()) {
        display();
        return;
    }
    setTimeout(work, 10)
}

function create_elem(type, id, class_name, style = "", text = "") {
    if (type == "input") {
        return "<input id=" + id + " class=" + class_name + (style == "" ? " style=" : "") + style + ">";
    }
    else if (type == "button") {
        return "<button id=" + id + " class=" + class_name + (style == "" ? " style=" : "") + style + ">" + text + "</button>";
    }
    else if (type == "div") {
        return "<button id=" + id + " class=" + class_name + (style == "" ? " style=" : "") + style + ">" + text + "</button>"
    }
}

function check() {
    return document.getElementsByClassName("background-music child-setting").length > 0;
}

function restart() {
    var flag = false;
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

function get_num(elem) {
    var a = elem.getElementsByClassName("q-seq");
    if (a.length == 0) return 0;
    var x = Number(a[0].textContent)
    return isNaN(x) ? 0 : x;
}

function get_que_list() {
    var res = [];
    var x = document.getElementsByClassName("q-content");
    for (var i = 0; i < x.length; i++) {
        var elem = x[i], nu = get_num(elem);
        if (nu > 0) {
            res[nu - 1] = elem;
        }
    }
    return res;
}

function set_answer(elem, answer) {
    function format(answer) {
        var a = answer.charCodeAt();
        if ('a'.charCodeAt() <= a && a <= 'z'.charCodeAt()) {
            return a - 'a'.charCodeAt();
        }
        else {
            return a - 'A'.charCodeAt();
        }
    }

    var a = format(answer);
    var b = elem.getElementsByClassName("wj-checkbox__original");

    function is_selected(answer) {
        return b[answer].parentNode.className.indexOf("is-checked") != -1;
    }

    if (is_selected(a)) return;
    else b[a].click();
}

function set_answers(s, t, answers) {
    var que_list = get_que_list();
    for (var i = s; i <= t; i++) {
        var x = que_list[i - 1];
        set_answer(x, answers[i - s]);
    }
    restart();
}

function set_text(elem, text) {
    elem.dispatchEvent(new Event("focus"));
    elem.textContent = text;
    elem.dispatchEvent(new Event("input"))
    elem.dispatchEvent(new Event("blur"))
}

function set_option(elem, index, text) {
    var a = elem.getElementsByClassName("transition-box")[0].getElementsByClassName("richTextArea")[index - 1];
    set_text(a, text);
}

function set_title(elem, text) {
    var x = elem.getElementsByClassName("richTextArea")[0];
    set_text(x, text);
}

function copy(n) {
    for (var i = 1; i <= n; i++) {
        document.getElementsByClassName("question-module draggable-module question-focus")[0].getElementsByClassName("svg-icon wj-tooltip q-operate-icon")[3].click();
    }
    restart();
}

function set_options_text(s, t, text) {
    function str_reslove(text, i, j) {
        var res = text.replace(qu_nu, String(i)).replace(op_nu, String(j));
        res = res.replace("\\[", "[").replace("\\]", "]").replace("\\\\", "\\");
        return res;
    }
    var que_list = get_que_list();
    for (var i = s; i <= t; i++) {
        var x = que_list[i - 1];
        for (var j = 1; j <= 4; j++) {
            set_option(x, j, String.fromCharCode("A".charCodeAt() + j - 1) + str_reslove(text, i - s + 1, j));
        }
    }
    restart();
}

function set_titles(s, t, text) {
    function str_reslove(text, i) {
        return text.replace(qu_nu, String(i)).replace("\\[", "[").replace("\\]", "]").replace("\\\\", "\\");
    }
    var que_list = get_que_list();
    for (var i = s; i <= t; i++) {
        var x = que_list[i - 1];
        set_title(x, str_reslove(text, i - s + 1));
    }
    restart();
}

function click_function1() {
    var elem = document.getElementById("text_box1");
    copy(Number(elem.value));
}

function click_function2() {
    var str = document.getElementById("text_box2").value;
    var a = str.split(/\s+/), b = "";
    for (var i = 2; i < a.length; i++) b += a[i];
    set_answers(a[0], a[1], b);
}

function click_function3() {
    var str = document.getElementById("text_box3").value;
    var a = str.split(/\s+/), b = "";
    for (var i = 2; i < a.length; i++) b += a[i];
    set_options_text(a[0], a[1], b);
}

function click_function4() {
    var str = document.getElementById("text_box4").value;
    var a = str.split(/\s+/), b = "";
    for (var i = 2; i < a.length; i++) b += a[i];
    set_titles(a[0], a[1], b);
}

function display() {
    document.getElementsByClassName("background-music child-setting")[0].insertAdjacentHTML("afterend", style + Elem1 + Elem2 + Elem3 + Elem4);
    document.getElementById("copy_button").onclick = click_function1;
    document.getElementById("set_answers_button").onclick = click_function2;
    document.getElementById("set_opoints_button").onclick = click_function3;
    document.getElementById("set_titles_button").onclick = click_function4;
}
