YUI.add("moodle-atto_wordimport-button",function(e,t){var n="atto_wordimport";e.namespace("M.atto_wordimport").Button=e.Base.create("button",e.M.editor_atto.EditorPlugin,[],{_currentSelection:null,_form:null,initializer:function(){if(this.get("disabled"))return;this.addButton({icon:"wordimport",iconComponent:n,callback:function(){this.get("host").showFilepicker("link",this._handleWordFileUpload,this)},title:"importfile",callbackArgs:"wordimport"}),this.editor.on("drop",this._handleWordFileDragDrop,this)},_handleWordFileUpload:function(t){var n=this.get("host"),r=n.get("filepickeroptions"),i="",s=r.link;if(t.url==="")return!1;i=t.url.replace(/.*\/draftfile.php\/([0-9]*)\/.*/i,"$1");if(/\.doc[xm]$/.test(t.file)===!1)return!1;var o=this,u=new XMLHttpRequest;u.onreadystatechange=function(){var t=o.editor.one("#myhtml"),n,r;if(u.readyState===4)if(u.status===200){n=JSON.parse(u.responseText);if(n){if(n.error)return t&&t.remove(!0),new M.core.ajaxException(n);r=e.Node.create(n.html),t?t.replace(r):o.editor.appendChild(r),o.markUpdated()}}else e.use("moodle-core-notification-alert",function(){new M.core.alert({message:M.util.get_string("servererror","moodle")})}),t&&t.remove(!0)};var a="ctx_id="+i,f="itemid="+s.itemid,l="/lib/editor/atto/plugins/wordimport/import.php?";return u.open("GET",M.cfg.wwwroot+l+a+"&"+f,!0),u.send(),!0},_handleWordFileDragDrop:function(t){var n=this,r=this.get("host"),i="application/vnd.openxmlformats-officedocument.wordprocessingml.document";r.saveSelection(),t=t._event;var s=t.dataTransfer&&t.dataTransfer.files&&t.dataTransfer.files.length;if(s&&i===t.dataTransfer.files[0].type){var o=r.get("filepickeroptions").link,u=o.savepath===undefined?"/":o.savepath,a=new FormData,f=0,l="",c=new XMLHttpRequest,h=Object.keys(o.repositories);t.preventDefault(),t.stopPropagation(),a.append("repo_upload_file",t.dataTransfer.files[0]),a.append("itemid",o.itemid);for(var p=0;p<h.length;p++)if(o.repositories[h[p]].type==="upload"){a.append("repo_id",o.repositories[h[p]].id);break}a.append("env",o.env),a.append("sesskey",M.cfg.sesskey),a.append("client_id",o.client_id),a.append("savepath",u),a.append("ctx_id",o.context.id),f=(new Date).getTime(),l="moodleimage_"+Math.round(Math.random()*1e5)+"-"+f,r.focus(),r.restoreSelection(),n.markUpdated(),c.onreadystatechange=function(){var t=n.editor.one("#"+l),r,i,s;if(c.readyState===4)if(c.status===200){r=JSON.parse(c.responseText);if(r){if(r.error)return t&&t.remove(!0),new M.core.ajaxException(r);i=r,r.event&&r.event==="fileexists"&&(i=r.newfile),t?t.replace(s):n.editor.appendChild(s),n.markUpdated()}}else e.use("moodle-core-notification-alert",function(){new M.core.alert({message:M.util.get_string("servererror","moodle")})}),t&&t.remove(!0)},c.open("POST",M.cfg.wwwroot+"/repository/repository_ajax.php?action=upload",!0),c.send(a)}return!1}})},"@VERSION@",{requires:["moodle-editor_atto-plugin"]});
