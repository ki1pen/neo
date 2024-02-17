import Base      from './Base.mjs';
import DomAccess from '../DomAccess.mjs';

/**
 * Adds support for using the Monaco Code Editor within neo.
 * See: https://github.com/microsoft/monaco-editor
 * @class Neo.main.addon.MonacoEditor
 * @extends Neo.main.addon.Base
 */
class MonacoEditor extends Base {
    static config = {
        /**
         * @member {String} className='Neo.main.addon.MonacoEditor'
         * @protected
         */
        className: 'Neo.main.addon.MonacoEditor',
        /**
         * Remote method access for other workers
         * @member {Object} remote
         * @protected
         */
        remote: {
            app: [
                'createInstance',
                'destroyInstance',
                'getValue',
                'setValue'
            ]
        }
    }

    /**
     * Stores component DOM ids as keys and editor instances as values
     * @member {Object} map={}
     */
    map = {}

    /**
     * @param {Object} config
     */
    construct(config) {
        super.construct(config);
        this.loadFiles()
    }

    /**
     * @param {Object} data
     * @param {String} data.id
     * @param {String} data.value
     */
    createInstance(data) {
        this.map[data.id] = monaco.editor.create(DomAccess.getElement(data.id), {
            language: 'javascript',
            value   : data.value
        })
    }

    /**
     * @param {Object} data
     * @param {String} data.id
     */
    destroyInstance(data) {
        // todo: destroy the editor instance if possible
        delete this.map[data.id]
    }

    /**
     * @param {Object} data
     * @returns {Object}
     */
    getValue(data) {
        console.log('getValue', data);

        return {}
    }

    /**
     *
     */
    loadFiles() {
        window.require = { paths: { vs: '../../../../node_modules/monaco-editor/min/vs' } };

        Promise.all([
            DomAccess.loadStylesheet('../../../../node_modules/monaco-editor/min/vs/editor/editor.main.css', {name: 'vs/editor/editor.main'}),
            DomAccess.loadScript('../../../../node_modules/monaco-editor/min/vs/loader.js'),
            DomAccess.loadScript('../../../../node_modules/monaco-editor/min/vs/editor/editor.main.nls.js'),
            DomAccess.loadScript('../../../../node_modules/monaco-editor/min/vs/editor/editor.main.js')
        ]).then(() => {
            // console.log('files loaded');
        })
    }

    /**
     * @param {Object} data
     * @param {String} data.id
     * @param {String} data.value
     */
    setValue(data) {
        this.map[data.id].getModel().setValue(data.value)
    }
}

Neo.applyClassConfig(MonacoEditor);

export default MonacoEditor;
