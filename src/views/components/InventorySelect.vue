<template>
  <el-drawer :model-value="show" title="재고 선택" @close="handleCancelClick" :size="size" :close-on-click-modal="false"
             append-to-body>
    <el-form :inline="true" label-width="68px">
      <el-form-item label="상품명">
        <el-input v-model="query.itemName" clearable placeholder="상품명"></el-input>
      </el-form-item>
      <el-form-item label="상품 코드">
        <el-input class="w200" v-model="query.itemCode" clearable placeholder="상품 코드"></el-input>
      </el-form-item>
      <el-form-item label="규격명">
        <el-input class="w200" v-model="query.skuName" clearable placeholder="규격명"></el-input>
      </el-form-item>
      <el-form-item label="규격 코드">
        <el-input class="w200" v-model="query.barcode" clearable placeholder="규격 코드"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="loadAll">조회</el-button>
      </el-form-item>
    </el-form>
    <el-table :data="list" @selection-change="handleSelectionChange" border :row-key="getRowKey" empty-text="재고가 없습니다."
              v-loading="loading" ref="inventorySelectFormRef" cell-class-name="my-cell" class="mt20">
      <el-table-column type="selection" width="55" :reserve-selection="true" :selectable="judgeSelectable"/>
      <el-table-column label="상품 정보" prop="itemId">
        <template #default="{ row }">
          <div>{{ row.item.itemName }}</div>
          <div v-if="row.item.itemCode">코드：{{ row.item.itemCode }}</div>
          <div v-if="row.item.itemBrand">브랜드：{{ useWmsStore().itemBrandMap.get(row.item.itemBrand).brandName }}</div>
        </template>
      </el-table-column>
      <el-table-column label="규격 정보">
        <template #default="{ row }">
          <div>{{ row.itemSku.skuName }}</div>
          <div v-if="row.itemSku.skuCode">코드：{{ row.itemSku.skuCode }}</div>
          <div v-if="row.itemSku.barcode">바코드：{{ row.itemSku.barcode }}</div>
        </template>
      </el-table-column>
      <el-table-column label="잔여 재고" prop="quantity" align="right">
        <template #default="{ row }">
          <el-statistic :value="Number(row.quantity)" :precision="0"/>
        </template>
      </el-table-column>
    </el-table>
    <el-row>
      <pagination
        v-show="total>0"
        :total="total"
        v-model:limit="pageReq.size"
        v-model:page="pageReq.page"
        @pagination="getList"
        class="mr10"
      />
    </el-row>

    <template v-slot:footer>
      <div style="width: 100%;display: flex;justify-content: space-between">
        <span>
        </span>
        <span>
          <el-button @click="handleCancelClick">취소</el-button>
          <el-button type="primary" @click="handleOkClick">확인</el-button>
      </span>
      </div>
    </template>
  </el-drawer>
</template>
<script setup name="InventorySelect">
import {computed, getCurrentInstance, nextTick, onMounted, reactive, ref, watch} from 'vue';
import {ElForm} from "element-plus";
import {getRowspanMethod} from "@/utils/getRowSpanMethod";
import {useRouter} from "vue-router";
import {useWmsStore} from '@/store/modules/wms'
import {listInventory} from "@/api/wms/inventory";
import {getWarehouseAndSkuKey} from "@/utils/wmsUtil";

const {proxy} = getCurrentInstance()

const spanMethod = computed(() => getRowspanMethod(list.value, ['itemId']))
const router = useRouter()
const loading = ref(false)
const deptOptions = ref([]);
const query = reactive({
  itemName: '',
  itemCode: '',
  skuName: '',
  skuCode: '',
  minQuantity: 1,
  areaId: null,
  warehouseId: null
});
const selectInventoryVoCheck = ref([])
const inventorySelectFormRef = ref(null)
const total = ref(0);
const pageReq = reactive({
  page: 1,
  size: 10,
});
const list = ref([]);
const rightList = ref([]);
const rightListKeySet = computed(() => {
  const set = new Set();
  rightList.value.forEach((it) => set.add(it.id));
  return set
});

const editableList = computed(() => {
  return list.value.filter((it) => !rightListKeySet.value.has(it.id));
});

const loadAll = () => {
  pageReq.page = 1
  getList()
};
const getRowKey = (row) => {
  return row.id;
}
const getList = () => {
  const data = {
    ...query,
    pageNum: pageReq.page,
    pageSize: pageReq.size
  }
  loading.value = true
  listInventory(data).then((res) => {
    const content = [...res.rows];
    list.value = content.map((item) => (
      {
        ...item,
        warehouseName: useWmsStore().warehouseMap.get(item.warehouseId)?.warehouseName
      }
    ));
    total.value = res.total;
  }).then(() => toggleSelection()).finally(() => loading.value = false);
}

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: '30%'
  },
  selectedInventory: {
    type: Array,
    default: []
  }
})

const show = computed(() => {
  return props.modelValue;
})

const emit = defineEmits(["handleCancelClick", 'handleOkClick']);

function handleCancelClick() {
  emit('handleCancelClick');
  clearSelected()
}

function handleOkClick() {
  emit('handleOkClick', selectInventoryVoCheck.value);
  clearSelected()
}

/** 多选框选中数据 */
const handleSelectionChange = (selection) => {
  selectInventoryVoCheck.value = selection
}

const toggleSelection = () => {
  props.selectedInventory.forEach(selected => {
    const index = list.value.findIndex(it => getWarehouseAndSkuKey(selected) === getWarehouseAndSkuKey(it))
    if (index !== -1) {
      inventorySelectFormRef.value.toggleRowSelection(list.value[index], true)
    }
  })
}

function clearSelected() {
  inventorySelectFormRef.value.clearSelection()
}

const judgeSelectable = (row) => {
  if (props.selectedInventory.find(selected => getWarehouseAndSkuKey(selected) === getWarehouseAndSkuKey(row))) {
    return false;
  }
  return true
}

const setWarehouseId = (warehouseId = null) => {
  query.warehouseId = warehouseId
}

defineExpose({
  setWarehouseId,
  getList
})
onMounted(() => {
  loadAll();
})
</script>
<style lang="scss">
.el-table .my-cell {
  vertical-align: top
}

.el-statistic__content {
  font-size: 14px;
}
</style>

