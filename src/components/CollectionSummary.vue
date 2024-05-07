<!-- A natural-language summary of a collection of things. -->
<script>

import { useParcelsStore } from '@/stores/ParcelsStore';

export default {
  data() {
    return {
      context: {
        singular: function(list){
          return 'There is ' + list + ' at this address.';
        },
        plural: function(list){
          return 'There are ' + list + ' at this address.';
        },
      },
      types: [
        {
          value: 1,
          label: 'active parcel',
        },
        {
          value: 2,
          label: 'inactive parcel',
        },
        {
          value: 3,
          label: 'remainder parcel',
        },
      ],
    }
  },
  props: [
    'value',
    'descriptor',
  ],
  computed: {
    // the final stringified output
    summary() {
      // get value quantity map
      const valueQuantities = this.valueQuantities;
      // check if plural
      const isPlural = this.isPlural(valueQuantities);
      // get context renderer
      const contextFnKey = 'context' + (isPlural ? 'Plural' : 'Singular');
      const contextFn = this[contextFnKey];
      // get a natural list
      const naturalList = this.naturalList;
      // summarize
      const summary = contextFn(naturalList);

      return summary;
    },
    contextSingular() {
      // console.log('contextSingular is running');
      const context = this.$data.context;
      return context.singular || context;
    },
    contextPlural() {
      const context = this.$data.context;
      // console.log('contextPlural, context.plural:', context.plural);
      return context.plural || context;
    },
    descriptorSingular() {
      const descriptor = this.$props.descriptor;
      return descriptor.singular || descriptor;
    },
    descriptorPlural() {
      const descriptor = this.$props.descriptor;
      return descriptor.plural || descriptor + 's';
    },
    // serializes naturalized quantities into a list
    // e.g. "1 apple and 2 oranges"
    naturalList() {
      const valueQuantities = this.valueQuantities;
      const items = this.naturalizeQuantities(valueQuantities);
      // console.log('in naturalList, items:', items);
      const len = items.length;
      if (Array.isArray(items) && len > 0) {
        if (len === 1) {
          return items[0];
        } else if (len === 2) {
          return items.join(' and ');
        }
        const leadingItems = items.slice(0, items.length - 1).join(', ');
        const lastItem = items[items.length - 1];
        return `${leadingItems}, and ${lastItem}`;
      }
      // TODO should this text be an option?
      return `no ${this.descriptorPlural}`;
    },
    valueQuantities() {
      const ParcelsStore = useParcelsStore();
      const items = ParcelsStore.dor.features;
      // const items = this.slots.items(this.$store.state);
      // console.log('valueQuantities, items:', items);
      if (!items) {
        return;
      }
      // const getValue = this.$data.getValue;

      // make an object of value => quantity
      const valueQuantities = items.reduce((obj, item) => {
        // console.log('in reduce, obj:', obj, 'item:', item);
        const val = item.properties[this.$props.value];
        obj[val] = obj[val] || 0;
        obj[val]++;
        return obj;
      }, {});

      return valueQuantities;
    },
  },
  methods: {
    // takes the value of the valueQuantities computed property and returns
    // the appropriate grammatical number.
    isPlural(valueQuantities = {}) {
      const values = Object.keys(valueQuantities);
      if (values.length === 1) {
        const firstValue = values[0];
        const quantity = valueQuantities[firstValue];
        if (quantity === 1) {
          return false;
        }
      }
      return true;
    },
    // takes the value quantity map and converts values to natural language
    // quantities (e.g. {apple: 2} => "2 apples")
    naturalizeQuantities(valueQuantities = {}) {
      // get some data
      const types = this.$data.types;
      const includeZeroes = this.$data.includeZeroes;

      // convert to natural language and sort per order of types option
      const quantities = types.reduce((acc, type) => {
        const value = type.value;
        let quantity = valueQuantities[value] || 0;

        if (quantity === 0) {
          if (!includeZeroes) {
            return acc;
          }
          // natural zero => "no"
          quantity = 'no';
        }

        const labelSingular = type.label;
        let labelWithNumber;

        // singular
        if (quantity !== 1  && this.$data.context.pluralizeList != false) {
          const labelPlural = type.plural || labelSingular + 's';
          labelWithNumber = labelPlural;
          // plural
        } else {
          labelWithNumber = labelSingular;
        }

        // make label and push
        const quantityWithLabel = `${quantity} ${labelWithNumber}`;
        acc.push(quantityWithLabel);

        return acc;
      }, []);

      return quantities;
    },
  },
};
</script>

<template>
  <div class="mb-4">
    {{ summary }}
  </div>
</template>

<style scoped>

</style>
