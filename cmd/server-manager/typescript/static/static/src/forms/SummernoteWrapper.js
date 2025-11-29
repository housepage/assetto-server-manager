"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SummernoteWrapper = void 0;
class SummernoteWrapper {
    constructor($element, opts, code) {
        this.$element = $element;
        this.opts = opts;
        this.code = code;
    }
    render() {
        this.opts.callbacks = {
            onImageUpload: (files) => {
                for (let file of files) {
                    this.uploadFile(file);
                }
            }
        };
        this.$element.summernote(this.opts);
        if (this.code) {
            this.$element.summernote("code", this.code);
        }
    }
    uploadFile(file) {
        let data = new FormData();
        data.append("image", file);
        $.ajax({
            url: "/api/image-upload",
            type: "POST",
            data: data,
            contentType: false,
            processData: false,
            success: (url) => {
                this.$element.summernote("editor.insertImage", url);
            },
        });
    }
}
exports.SummernoteWrapper = SummernoteWrapper;
//# sourceMappingURL=SummernoteWrapper.js.map