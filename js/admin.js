$(function() {
    // Fix for admin settings corectly removing the active class in the menu
    $(".nav-tabs li.nav-item a.nav-link").click(function() {
        $(".nav-tabs li.nav-item a.nav-link").removeClass('active');
    });

    var editElements = {};
    $('.editable').summernote({
        airMode: false,
        toolbar: [
            // [groupName, [list of button]]
            ['style', ['style']],
            ['font', ['bold', 'italic', 'underline', 'clear']],
            ['font', ['fontsize', 'color']],
            ['para', ['ul', 'ol', 'paragraph']],
            ['insert', ['link','image', 'doc', 'picture', 'video']], // image and doc are customized buttons
            ['table', ['table']],
            ['misc', ['codeview']],
        ],
        placeholder: 'Click here to enter content.',
        callbacks: {
            onImageUpload: async function (files) {
                for (const file of files) {
                    const formData = new FormData();

                    formData.append("token", token);
                    formData.append("uploadFile", file);
                    $("#save").show();
                    await fetch('', {method: "POST", body: formData});

                    const imgNode = document.createElement('img');
                    imgNode.src = `${rootURL}data/files/${file.name}`;
                    $('#save').fadeOut();
                    $('.editable').summernote('insertNode', imgNode);
                    saveData($(this));
                }
            },
            onChange: function(contents, $editable) {
                editElements[$(this).attr('id')] = contents;
            },
            onBlur: function() {
                saveData($(this));
            }
        },
    });

    function saveData(editor) {
        console.log(editElements[editor.attr('id')])
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
