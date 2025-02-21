import CoreBase from '../core/Base.mjs';

/**
 * The base class for all other layouts.
 * Use it directly in case you want to create a container without a layout.
 * @class Neo.layout.Base
 * @extends Neo.core.Base
 */
class Base extends CoreBase {
    static config = {
        /**
         * @member {String} className='Neo.layout.Base'
         * @protected
         */
        className: 'Neo.layout.Base',
        /**
         * @member {String} ntype='layout-base'
         * @protected
         */
        ntype: 'layout-base',
        /**
         * The name of the App this layout belongs to
         * @member {String|null} appName_=null
         */
        appName_: null,
        /**
         * The Id of the Container instance this layout is bound to
         * @member {?String} containerId=null
         * @protected
         */
        containerId: null,
        /**
         * Identifier for all classes that extend layout.Base
         * @member {Boolean} isLayout=true
         * @protected
         */
        isLayout: true
    }

    /**
     * Triggered after the appName config got changed
     * @param {String|null} value
     * @param {String|null} oldValue
     * @protected
     */
    afterSetAppName(value, oldValue) {
        value && Neo.currentWorker.insertThemeFiles(value, this.__proto__);
    }

    /**
     * Placeholder method
     * @param {Neo.component.Base} item
     * @protected
     */
    applyChildAttributes(item) {}

    /**
     * Placeholder method
     * @protected
     */
    applyRenderAttributes() {}

    /**
     *
     */
    destroy() {
        let me = this;

        me.bind && Neo.getComponent(me.containerId).getModel()?.removeBindings(me.id);

        super.destroy();
    }

    /**
     * Returns the container model or its closest parent model
     * @param {String} [ntype]
     * @returns {Neo.model.Component|null}
     */
    getModel(ntype) {
        return Neo.getComponent(this.containerId).getModel();
    }

    /**
     * Applies all class configs to this instance
     * @param {Object} config
     * @param {Boolean} [preventOriginalConfig] True prevents the instance from getting an originalConfig property
     */
    initConfig(config, preventOriginalConfig) {
        super.initConfig(config, preventOriginalConfig);

        let me = this;

        me.bind && Neo.getComponent(me.containerId).getModel()?.parseConfig(me);
    }

    /**
     * Placeholder method
     * @param {Neo.component.Base} item
     * @protected
     */
    removeChildAttributes(item) {}

    /**
     * Placeholder method
     * @protected
     */
    removeRenderAttributes() {}
}

Neo.setupClass(Base);

export default Base;
