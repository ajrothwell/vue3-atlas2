<script setup>
import $config from '@/config';
import { computed, onBeforeMount } from 'vue';

import { useParcelsStore } from '@/stores/ParcelsStore';
const ParcelsStore = useParcelsStore();
import { useZoningStore } from '@/stores/ZoningStore';
const ZoningStore = useZoningStore();
import { useMainStore } from '@/stores/MainStore';
const MainStore = useMainStore();
import CollectionSummary from '@/components/CollectionSummary.vue';

import useTables from '@/composables/useTables';
const { paginationOptions } = useTables();

let selectedParcelId = computed(() => { return MainStore.selectedParcelId });
const selectedParcel = computed(() => {
  if (ParcelsStore.dor.features && ParcelsStore.dor.features.length > 0) {
    return ParcelsStore.dor.features.filter(feature => feature.id === selectedParcelId.value)[0];
  }
});

// ZONING OVERLAYS
const zoningOverlays = computed(() => {
  if (!ZoningStore.zoningOverlays[selectedParcelId.value]) return [];
  return ZoningStore.zoningOverlays[selectedParcelId.value].rows || [];
});

// ZONING APPEALS
const zoningAppealsCompareFn = (a, b) => new Date(b.scheduleddate) - new Date(a.scheduleddate);
const zoningAppeals = computed(() => {
  if (!ZoningStore.zoningAppeals.rows) return [];
  return [ ...ZoningStore.zoningAppeals.rows ].sort(zoningAppealsCompareFn);
});

onBeforeMount(() => {
  console.log('Zoning.vue onBeforeMount');
  if (ParcelsStore.dor.features && ParcelsStore.dor.features.length > 0) {
    MainStore.selectedParcelId = ParcelsStore.dor.features[0].properties.OBJECTID;
  }
});

const longCode = computed(() => {
  if (ZoningStore.zoningBase[selectedParcelId.value] && ZoningStore.zoningBase[selectedParcelId.value].rows) {
    return ZoningStore.zoningBase[selectedParcelId.value].rows[0].long_code;
  }
});

const hexForLongCode = computed(() => {
  if (ZoningStore.zoningBase[selectedParcelId.value] && ZoningStore.zoningBase[selectedParcelId.value].rows) {
    const longCode = ZoningStore.zoningBase[selectedParcelId.value].rows[0].long_code.replace('-', '');
    return $config.zoningColors[longCode];
  }
});

const description = computed(() => {
  if (ZoningStore.zoningBase[selectedParcelId.value] && ZoningStore.zoningBase[selectedParcelId.value].rows) {
    return $config.ZONING_CODE_MAP[ZoningStore.zoningBase[selectedParcelId.value].rows[0].long_code]
  }
})

const pendingBillsTableData = computed(() => {
  return {
    columns: [
      {
        label: 'Bill Type',
        field: 'billType',
      },
      {
        label: 'Current Zoning',
        field: 'currentZoning',
      },
      {
        label: 'Pending Bill',
        field: 'pendingbillurl',
        html: true,
      },
    ],
    rows: ZoningStore.pendingBills[selectedParcelId.value] || [],
  }
});

const overlaysTableData = computed(() => {
  return {
    columns: [
      {
        label: 'Name',
        field: 'overlay_name',
      },
      {
        label: 'Code Section',
        field: 'link',
        html: true,
      },
    ],
    rows: zoningOverlays.value || [],
  }
});

const appealsTableData = computed(() => {
  return {
    columns: [
      {
        label: 'Processed Date',
        field: 'createddate',
        type: 'date',
        dateInputFormat: "yyyy-MM-dd'T'HH:mm:ssX",
        dateOutputFormat: 'MM/dd/yyyy',
      },
      {
        label: 'Id',
        field: 'decision',
        html: true,
      },
      {
        label: 'Description',
        field: 'appealgrounds',
      },
      {
        label: 'Scheduled Date',
        field: 'scheduleddate',
        type: 'date',
        dateInputFormat: "yyyy-MM-dd'T'HH:mm:ssX",
        dateOutputFormat: 'MM/dd/yyyy',
      },
      {
        label: 'Status',
        field: 'decision',
      },
    ],
    rows: zoningAppeals.value || [],
  }
});

const rcosTableData = computed(() => {
  return {
    columns: [
      {
        label: 'RCO',
        field: 'properties.rco',
        html: true,
      },
      {
        label: 'Meeting Address',
        field: 'properties.MEETING_LOCATION_ADDRESS',
      },
      {
        label: 'Primary Contact',
        field: 'properties.contact',
        html: true,
      },
      {
        label: 'Preferred Method',
        field: 'properties.PREFFERED_CONTACT_METHOD',
      },
    ],
    rows: ZoningStore.rcos.features || [],
  }
});

</script>

<template>
  <div
    id="Zoning-description"
    class="box"
  >
    Base district zoning maps, associated zoning overlays, and Registered Community Organizations applicable to your search address. If you notice a discrepancy, please contact <a href="mailto:planning@phila.gov">planning@phila.gov</a>. Source: Department of Planning and Development
  </div>
  <collection-summary
    :value="'STATUS'"
    :descriptor="'parcel'"
  />
  <div
    v-if="selectedParcel"
    id="parcel-div"
    class="section add-borders p-3"
  >
    <div class="column is-12">
      <div class="columns is-multiline is-mobile">
        <button
          v-for="parcel in ParcelsStore.dor.features"
          :key="parcel.properties.OBJECTID"
          class="dor-parcel-select column is-3 add-borders has-text-centered p-2"
          :class="{ 'is-selected': parcel.properties.OBJECTID === selectedParcelId }"
          @click="MainStore.selectedParcelId = parcel.properties.OBJECTID"
        >
          {{ parcel.properties.MAPREG }}
        </button>
      </div>

      <div class="data-section has-text-centered">
        <div
          v-if="selectedParcel"
          class="columns mt-3"
        >
          <div class="columns is-multiline is-mobile column is-8 is-offset-2 has-text-centered badge">
            <div class="column is-12 badge-title">
              <b>Base District</b>
            </div>
            <div
              v-if="hexForLongCode"
              class="column is-2 code"
            >
              <div :style="{ 'height': '36px', 'width': '36px', 'background-color': hexForLongCode }" />
            </div>
            <div
              v-else
              class="column is-2 code"
            >
              <font-awesome-icon
                icon="fa-solid fa-spinner"
                spin
              />
            </div>
            <div
              v-if="longCode"
              class="column is-3 code"
            >
              <b>{{ longCode }}</b>
            </div>
            <div
              v-else
              class="column is-3 code"
            >
              <font-awesome-icon
                icon="fa-solid fa-spinner"
                spin
              />
            </div>
            <div
              v-if="description"
              class="column is-7 description"
            >
              {{ description }}
            </div>
            <div
              v-else
              class="column is-7 description"
            >
              <font-awesome-icon
                icon="fa-solid fa-spinner"
                spin
              />
            </div>
          </div>
        </div>
        <a
          target="_blank"
          href="https://www.phila.gov/media/20220909084529/ZONING-QUICK-GUIDE_PCPC_9_9_22.pdf"
        >See more info about zoning codes <font-awesome-icon icon="fa-solid fa-external-link-alt" /></a>
      </div>

      <div class="data-section">
        <h5 class="subtitle is-5 table-title">
          Pending Bills ({{ pendingBillsTableData.rows.length }})
        </h5>
        <div class="horizontal-table">
          <vue-good-table
            id="pending-bills"
            :columns="pendingBillsTableData.columns"
            :rows="pendingBillsTableData.rows"
            :pagination-options="paginationOptions"
            style-class="table"
          >
            <template #emptystate>
              <div v-if="ZoningStore.loadingZoningData">
                Loading pending bills... <font-awesome-icon
                  icon="fa-solid fa-spinner"
                  spin
                />
              </div>
              <div v-else>
                No pending bills found
              </div>
            </template>
          </vue-good-table>
        </div>
      </div>

      <div class="data-section">
        <h5 class="subtitle is-5 table-title">
          Overlays ({{ overlaysTableData.rows.length }})
        </h5>
        <vue-good-table
          id="overlays"
          :columns="overlaysTableData.columns"
          :rows="overlaysTableData.rows"
          :pagination-options="paginationOptions"
          style-class="table"
        >
          <template #emptystate>
            <div v-if="ZoningStore.loadingZoningData">
              Loading overlays... <font-awesome-icon
                icon="fa-solid fa-spinner"
                spin
              />
            </div>
            <div v-else>
              No overlays found
            </div>
          </template>
        </vue-good-table>
      </div>
    </div>
  </div>

  <h5 class="subtitle is-5 table-title">
    Appeals ({{ zoningAppeals.length }})
  </h5>
  <div class="horizontal-table">
    <vue-good-table
      id="appeals"
      :columns="appealsTableData.columns"
      :rows="appealsTableData.rows"
      :pagination-options="paginationOptions"
      style-class="table"
    >
      <template #emptystate>
        <div v-if="ZoningStore.loadingZoningData">
          Loading appeals... <font-awesome-icon
            icon="fa-solid fa-spinner"
            spin
          />
        </div>
        <div v-else>
          No appeals found
        </div>
      </template>
    </vue-good-table>
  </div>

  <div class="box">
    Looking for zoning documents? They are now located in the Licenses & Inspections tab under "Zoning Permit Documents".
  </div>

  <h5 class="subtitle is-5 table-title">
    Registered Community Organizations (RCOs) ({{ rcosTableData.rows.length }})
  </h5>
  <div
    id="rcos"
    class="horizontal-table"
  >
    <vue-good-table
      id="rcos"
      :columns="rcosTableData.columns"
      :rows="rcosTableData.rows"
      :pagination-options="paginationOptions"
      style-class="table"
    >
      <template #emptystate>
        <div v-if="ZoningStore.loadingZoningData">
          Loading RCOs... <font-awesome-icon
            icon="fa-solid fa-spinner"
            spin
          />
        </div>
        <div v-else>
          No RCOs found
        </div>
      </template>
    </vue-good-table>
  </div>
  <a
    target="_blank"
    href="//www.phila.gov/documents/registered-community-organization-rco-materials/"
  >See a list of all RCOs in the city [PDF] <font-awesome-icon icon="fa-solid fa-external-link-alt" /></a>
</template>

<style>

#parcel-div {
  margin-bottom: 1.5rem;
}

.badge-title {
  padding-top: 0.25rem !important;
  height: 2rem;
  color: white;
  background-color: rgb(68, 68, 68);
  /* background-color: #58c04d; */
  border-style: solid;
  border-color: white;
  border-width: 1px;
}

.code {
  background-color: #f0f0f0;
  border-style: solid;
  border-color: white;
  border-width: 1px;
  display: flex !important;
  align-items: center;
  justify-content: center;
}

.description {
  background-color: #f0f0f0;
  border-style: solid;
  border-color: white;
  border-width: 1px;
}

@media 
only screen and (max-width: 760px),
(min-device-width: 768px) and (max-device-width: 1024px)  {

	/* Label the data */
	#pending-bills {
    td {
      min-height: 60px;
    }

    td:nth-of-type(1):before { content: "Bill Type"; }
    td:nth-of-type(2):before { content: "Current Zoning"; }
    td:nth-of-type(3):before { content: "Pending Bill"; }
  }

  #overlays {
    td {
      min-height: 60px;
    }

    td:nth-of-type(1):before { content: "Name"; }
    td:nth-of-type(2):before { content: "Code Section"; }
  }

  #appeals {
    td {
      min-height: 60px;
    }

    td:nth-of-type(1):before { content: "Processed Date"; }
    td:nth-of-type(2):before { content: "Id"; }
    td:nth-of-type(3):before { content: "Description"; }
    td:nth-of-type(4):before { content: "Scheduled Date"; }
    td:nth-of-type(5):before { content: "Status"; }
  }

  #rcos {
    td {
      min-height: 60px;
    }

    td:nth-of-type(1):before { content: "RCO"; }
    td:nth-of-type(2):before { content: "Meeting Address"; }
    td:nth-of-type(3):before { content: "Primary Contact"; }
    td:nth-of-type(4):before { content: "Preferred Method"; }
  }
}

#rcos {
  td:nth-of-type(2) span { 
    word-wrap: break-word !important;
    display: inline-block !important;
    max-width: 180px !important;
  }
}

</style>