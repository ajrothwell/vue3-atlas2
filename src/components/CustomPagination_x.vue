<script>
// import { defineProps, computed, onMounted } from 'vue';

export default {

  props: {
    pageChanged: {
      type: Function,
    },
    perPageChanged: {
      type: Function,
    },
    currentPage: {
      type: Number,
    },
    totalRows: {
      type: Number,
    },
    totalPages: {
      Number,
    },
  },
  // data() {
  //   return {
  //     currentPage: this.currentPage,
  //   }
  // },
  computed: {
    theCurrentPage: {
      get() { return this.currentPage },
      set(value) {
        console.log('theCurrentPage set value:', value);
        this.$emit("update:currentPage", value);
        // props.currentPage = value;
      }
    }
  },
  methods: {
    customPageChange(customCurrentPage) {
      console.log('customCurrentPage:', customCurrentPage);
      this.pageChanged({currentPage: customCurrentPage});
    },
    customPerPageChange(customPerPage) {
      this.perPageChanged({currentPerPage: customPerPage});
    }
  },

  // const $emit = defineEmits(["update:currentPage"]);

  // const theCurrentPage = computed({
  //   get() { return props.currentPage },
  //   set(value) {
  //     console.log('theCurrentPage set value:', value);
  //     $emit("update:currentPage", value);
  //     // props.currentPage = value;
  //   }
  // })

  // const customPageChange = (customCurrentPage) => {
  //   console.log('customCurrentPage:', customCurrentPage);
  //   props.pageChanged({currentPage: customCurrentPage});
  //   theCurrentPage.value = customCurrentPage;
  // }


  mounted() {
    const my_func = (event) => {
      event.preventDefault();
    };
      
    const form = document.getElementById('page-form');
    // const form = document.getElementById('vgt-page-input-101');
    console.log('CustomPagination onMounted form:', form);

    // attach event listener
    form.addEventListener("submit", my_func, true);
  },
}

</script>

<template>
  <div class="vgt-wrap__footer vgt-clearfix">
    <div class="footer__navigation vgt-pull-right">
      <div class="footer__navigation__page-info">
        <form id="page-form">
          <label for="vgt-page-input-101" class="page-info__label">
            <span>page</span>
            <input id="vgt-page-input-101" type="number" class="footer__navigation__page-info__current-entry" v-model="theCurrentPage" @change="customPageChange(theCurrentPage)"/>
            <span>of {{ totalPages }}</span>
          </label>
          <span id="change-page-hint" style="display: none;">Type a page number and press Enter to change the page.</span>
        </form>
      </div>

      <button
        type="button"
        aria-controls="vgt-table"
        class="footer__navigation__page-btn"
        @click="customPageChange(currentPage - 1)"
      >
        <span aria-hidden="true" class="chevron left"></span>
      </button>

      <button
        type="button"
        aria-controls="vgt-table"
        class="footer__navigation__page-btn"
        @click="customPageChange(currentPage + 1)"
      >
        <span aria-hidden="true" class="chevron right"></span>
      </button>
    </div>
  </div>

</template>

<style scoped>


</style>