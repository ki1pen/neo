import Select from './Select.mjs';

/**
 * @class Neo.form.field.Chip
 * @extends Neo.form.field.Select
 */
class Chip extends Select {
    static config = {
        /**
         * @member {String} className='Neo.form.field.Chip'
         * @protected
         */
        className: 'Neo.form.field.Chip',
        /**
         * @member {String} ntype='chipfield'
         * @protected
         */
        ntype: 'chipfield',
        /**
         * @member {Object|null} listConfig={useCheckBoxes: true}
         */
        listConfig: {
            useCheckBoxes: true
        }
    }
}

Neo.setupClass(Chip);

export default Chip;
