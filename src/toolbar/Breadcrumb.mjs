import ClassSystemUtil from '../util/ClassSystem.mjs';
import Store           from '../data/Store.mjs';
import Toolbar         from '../toolbar/Base.mjs';

/**
 * @class Neo.toolbar.Breadcrumb
 * @extends Neo.toolbar.Base
 */
class Breadcrumb extends Toolbar {
    static config = {
        /**
         * @member {String} className='Neo.toolbar.Breadcrumb'
         * @protected
         */
        className: 'Neo.toolbar.Breadcrumb',
        /**
         * @member {Number|String|null} activeKey_=null
         */
        activeKey_: null,
        /**
         * @member {Object[]} items
         */
        items: [],
        /**
         * @member {Neo.data.Store|Object} store_=null
         */
        store_: null
    }

    /**
     * Triggered after the activeKey config got changed
     * @param {Number|String|null} value
     * @param {Number|String|null} oldValue
     * @protected
     */
    afterSetActiveKey(value, oldValue) {
        this.store.getCount?.() > 0 && this.updateItems()
    }

    /**
     * Triggered after the store config got changed
     * @param {Neo.data.Store|Object} value
     * @param {Neo.data.Store|Object} oldValue
     * @protected
     */
    afterSetStore(value, oldValue) {
        let me = this;

        value.on({
            load: this.onStoreLoad,
            scope: me
        });

        value?.getCount() > 0 && me.onStoreLoad(value.items)
    }

    /**
     * Triggered before the store config gets changed
     * @param {Neo.data.Store|Object} value
     * @param {Neo.data.Store|Object} oldValue
     * @returns {Neo.data.Store}
     * @protected
     */
    beforeSetStore(value, oldValue) {
        oldValue?.destroy();
        return ClassSystemUtil.beforeSetInstance(value, Store);
    }

    /**
     * @param {Object[]} items
     */
    onStoreLoad(items) {
        this.activeKey !== null && this.updateItems()
    }

    /**
     *
     */
    updateItems() {
        console.log('updateItems');
    }
}

Neo.applyClassConfig(Breadcrumb);

export default Breadcrumb;
