$(function() {
    // Fix for admin settings corectly removing the active class in the menu
    $(".nav-tabs li.nav-item a.nav-link").click(function() {
        $(".nav-tabs li.nav-item a.nav-link").removeClass('active');
    });

    var editElements = {};
    let timeoutSave;
    $('.editable').summernote({
        airMode: false,
        toolbar: [
            // [groupName, [list of button]]
            ['style', ['style']],
            ['font', ['bold', 'italic', 'underline', 'clear']],
            ['font', ['fontsize', 'color']],
            ['para', ['ul', 'ol', 'paragraph']],
            ['insert', ['link', 'doc', 'picture', 'video']], // image and doc are customized buttons
            ['table', ['table']],
            ['misc', ['codeview']],
        ],
        placeholder: 'Click here to enter content.',
        callbacks: {
            onImageUpload: async function (files) {
                for (const originalFile of files) {
                    if (originalFile instanceof File === false || originalFile.type.indexOf('image/') !== 0) {
                        console.log('Warning: file is not an image.');
                        return;
                    }

                    const options = {
                        maxSizeMB: 10,
                        maxWidthOrHeight: 1920,
                    }
                    let file = originalFile;

                    try {
                        file = await imageCompression(originalFile, options);
                    } catch (e) {
                        console.error('Error: image was not compressed. Fallback to user' +
                          ' uploaded file.');
                        console.error(e);
                    }

                    // Get filename from original file and filter the html tags
                    const originalFileName = originalFile.name.replace(/<[^>]*>?/gm, '');
                    const formData = new FormData();

                    formData.append("token", token);
                    // As file might be a blob (due to compression), we need to pass a filename
                    // separately
                    formData.append("uploadFile", file, originalFileName);
                    $("#save").show();
                    await fetch('', {method: "POST", body: formData});

                    const imgNode = document.createElement('img');
                    imgNode.src = `${rootURL}data/files/${file.name}`;
                    $('#save').fadeOut();
                    $(this).summernote('insertNode', imgNode);
                    saveData($(this));
                }
            },
            onChange: function(contents, $editable) {
                editElements[$(this).attr('id')] = contents;
            },
            onFocus: function (e) {
                clearTimeout(timeoutSave)
            },
            onBlur: function(e) {
                const that = $(this);
                timeoutSave = setTimeout(function () { saveData(that) }, 200)
            }
        },
    });

    function saveData(editor) {
        if (editElements[editor.attr('id')]!=undefined) {
            // Confirmation popup for saving changes (set in the database)
            if (typeof saveChangesPopup !== 'undefined' && saveChangesPopup && !confirm('Save new changes?')) {
                alert("Changed are not saved, you can continue to edit or refresh the page.");
                return
            }

            var id = editor.attr('id');
            var content = editElements[editor.attr('id')];
            var target = (editor.attr('data-target')!=undefined) ? editor.attr('data-target'):'pages';
            editElements[editor.attr('id')] = undefined;
            $.post("",{
                fieldname: id,
                content: content,
                target: target,
                token: token,
            })
              .done(function() {
                  $("#save").show();
                  $('#save').delay(100).fadeOut();
              });
        }
    }
});
