document.addEventListener('DOMContentLoaded', function() {
                                document.getElementById('memo-input-form').addEventListener('submit', saveMemo);
                                fetchMemos();
                                });

var split_client;

function create_UUID(){
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    });
    return uuid;
}


function setCookie(name, value, days) {
    var expires = '';
    if (days) {
	var date = new Date();
	date.setTime(date.getTime() + days*24*60*60*100); 
	expires = '; expires=' + date.toUTCString();
    }
    document.cookie = name + '=' + (value || '') + expires + '; path=/';
}


function getCookie(name) {
    var nameEQ = name + '=';
    var ca = document.cookie.split(';');
    for (var i=0; i < ca.length; i++) {
	var c = ca[i];
	while (c.charAt(0) == ' ')  {
	    c = c.substring(1,c.length);
	}
	if (c.indexOf(nameEQ) == 0) {
	    return c.substring(nameEQ.length,c.length);
	}
    }
    return null;
}


function saveMemo(e) {
  var memoSubject = document.getElementById('memo-subject').value;
  var memoPriority = document.getElementById('memo-priority').value;
  var memoId = create_UUID();
  var memoStatus = 'Open';

  amplitude.track('Memo Interacted', {'action': 'add', 'priority': memoPriority, 'memo_id': memoId}); 

  var memo = {
    id: memoId,
    subject: memoSubject,
    priority: memoPriority,
    status: memoStatus
  }

  if (localStorage.getItem('memos') == null) {
    var memos = [];
    memos.push(memo);
    localStorage.setItem('memos', JSON.stringify(memos));
  } else {
    var memos = JSON.parse(localStorage.getItem('memos'));
    memos.push(memo);
    localStorage.setItem('memos', JSON.stringify(memos));
  }

  document.getElementById('memo-input-form').reset();

  fetchMemos();

  e.preventDefault();
}

function setStatusDone(id) {
  var memos = JSON.parse(localStorage.getItem('memos'));


  for (var i = 0; i < memos.length; i++) {
    if (memos[i].id == id) {
      memos[i].status = 'Done';
      amplitude.track('Memo Interacted', {'action': 'close', 'priority': memos[i].priority, 'memo_id': id}); 
    }
  }

  localStorage.setItem('memos', JSON.stringify(memos));

  fetchMemos();
}

function deleteMemo(id) {
  var memos = JSON.parse(localStorage.getItem('memos'));


  for (var i = 0; i < memos.length; i++) {
    if (memos[i].id == id) {
      amplitude.track('Memo Interacted', {'action': 'delete', 'priority': memos[i].priority, 'memo_id': id}); 
      memos.splice(i, 1);
    }
  }

  localStorage.setItem('memos', JSON.stringify(memos));

  fetchMemos();
}

function fetchMemos() {
  var memos = JSON.parse(localStorage.getItem('memos'));
  var memosList = document.getElementById('memosList');
  var memoTable = '<table class="pure-table pure-table-horizontal">' +
                  '<thead><tr><th>Subject</th><th>Priority</th><th>Status</th><th></th><th></th></tr></thead>';

  for (var i = 0; i < memos.length; i++) {
    var id = memos[i].id;
    var subject = memos[i].subject;
    var priority = memos[i].priority;
    var status = memos[i].status;
    var closeBtnClass = (status == 'Done') ? 'pure-button pure-button-disabled' : 'pure-button';

    memoTable += '<tr>' +
	     '<td>' + subject + '</td>' +
	     '<td>' + priority + '</td>' +
	     '<td>' + status + '</td>' +
	     '<td><a href="#" id=close'+ i + ' onclick="setStatusDone(\''+id+'\')" class="' + closeBtnClass + '">Done</a>' +
	     '<td><a href="#" id=delete'+ i + ' onclick="deleteMemo(\''+id+'\')" class="pure-button">Delete</a>' +
             '</tr>';
  }
    memoTable += '</table>';
    memosList.innerHTML = memoTable;
}
