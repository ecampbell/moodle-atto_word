// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/*
 * @package    atto_wordimport
 * @copyright  2015 Eoin Campbell
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

/**
 * @module moodle-atto_wordimport-button
 */

/**
 * Atto text editor import Microsoft Word file plugin.
 *
 * This plugin adds the ability to drop a Word file in and have it automatically
 * convert the contents into XHTML and into the text box.
 *
 * @namespace M.atto_wordimport
 * @class Button
 * @extends M.editor_atto.EditorPlugin
 */

Y.namespace('M.atto_wordimport').Button = Y.Base.create('button', Y.M.editor_atto.EditorPlugin, [], {
    /**
     * A reference to the current selection at the time that the dialogue
     * was opened.
     *
     * @property _currentSelection
     * @type Range
     * @private
     */
    _currentSelection: null,

    /**
     * The most recently selected image.
     *
     * @param _selectedImage
     * @type Node
     * @private
     */
    _selectedImage: null,

    /**
     * A reference to the currently open form.
     *
     * @param _form
     * @type Node
     * @private
     */
    _form: null,

    /**
     * The dimensions of the raw image before we manipulate it.
     *
     * @param _rawImageDimensions
     * @type Object
     * @private
     */
    _rawImageDimensions: null,

    /**
     * Add event listeners.
     *
     * @method initializer
     */

    initializer: function() {

        this.addButton({
            icon: 'f/document',
            callback: function() {
                    this.get('host').showFilepicker('link', this._handleWordFileUpload, this);
            },
            buttonName: 'iconone',
            callbackArgs: 'wordimport',
            tags: 'img',
            tagMatchRequiresAll: false
        });
        this.editor.on('drop', this._handleWordFileDragDrop, this);
    },

    /**
     * Handle a Word file upload
     *
     * @method _handleWordFileUpload
     * @param {object} params The parameters provided by the filepicker
     * containing information about the file.
     * @private
     */
    _handleWordFileUpload: function(params) {
        if (params.url === '') {
            Y.log('URL is null');
            return false;
        }
        Y.log('URL is ' + params.url);
        Y.log('File is ' + params.file);
        if (/docx$/.test(params.file) === false) {
            Y.log('File is not a Word 2010 file: ' + params.file);
            return false;
        }

        return true;
    },

    /**
     * Handle a drag and drop event with a Word file.
     *
     * @method _handleWordFileDragDrop
     * @param {EventFacade} e
     * @private
     */
    _handleWordFileDragDrop: function(e) {

        var self = this,
            host = this.get('host');
        var requiredFileType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

        host.saveSelection();
        e = e._event;

        Y.log('File type is ' + e.dataTransfer.files[0].type);
        // Only handle the event if an image file was dropped in.
        var handlesDataTransfer = (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length);
        if (handlesDataTransfer && requiredFileType === e.dataTransfer.files[0].type) {

            Y.log('File type match succeeded ');
            var options = host.get('filepickeroptions').image,
                savepath = (options.savepath === undefined) ? '/' : options.savepath,
                formData = new FormData(),
                timestamp = 0,
                uploadid = "",
                xhr = new XMLHttpRequest(),
                keys = Object.keys(options.repositories);


            e.preventDefault();
            e.stopPropagation();
            formData.append('repo_upload_file', e.dataTransfer.files[0]);
            formData.append('itemid', options.itemid);

            // List of repositories is an object rather than an array.  This makes iteration more awkward.
            for (var i = 0; i < keys.length; i++) {
                if (options.repositories[keys[i]].type === 'upload') {
                    formData.append('repo_id', options.repositories[keys[i]].id);
                    break;
                }
            }
            formData.append('env', options.env);
            formData.append('sesskey', M.cfg.sesskey);
            formData.append('client_id', options.client_id);
            formData.append('savepath', savepath);
            formData.append('ctx_id', options.context.id);

            // Insert spinner as a placeholder.
            timestamp = new Date().getTime();
            uploadid = 'moodleimage_' + Math.round(Math.random() * 100000) + '-' + timestamp;
            host.focus();
            host.restoreSelection();
            self.markUpdated();

            // Kick off a XMLHttpRequest.
            xhr.onreadystatechange = function() {
                var placeholder = self.editor.one('#' + uploadid),
                    result,
                    file,
                    newimage;

                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        result = JSON.parse(xhr.responseText);
                        if (result) {
                            if (result.error) {
                                if (placeholder) {
                                    placeholder.remove(true);
                                }
                                return new M.core.ajaxException(result);
                            }

                            file = result;
                            if (result.event && result.event === 'fileexists') {
                                // A file with this name is already in use here - rename to avoid conflict.
                                // Chances are, it's a different image (stored in a different folder on the user's computer).
                                // If the user wants to reuse an existing image, they can copy/paste it within the editor.
                                file = result.newfile;
                            }

                            // Replace placeholder with actual image.
                            if (placeholder) {
                                placeholder.replace(newimage);
                            } else {
                                self.editor.appendChild(newimage);
                            }
                            self.markUpdated();
                        }
                    } else {
                        Y.use('moodle-core-notification-alert', function() {
                            new M.core.alert({message: M.util.get_string('servererror', 'moodle')});
                        });
                        if (placeholder) {
                            placeholder.remove(true);
                        }
                    }
                }
            };
            xhr.open("POST", M.cfg.wwwroot + '/repository/repository_ajax.php?action=upload', true);
            xhr.send(formData);
        }
        Y.log('File type test failed: ' + e.dataTransfer.files[0].type);
        return false;

    }


});
