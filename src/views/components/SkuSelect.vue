<template>
  <el-drawer :model-value="show" title="상품 선택" @close="handleCancelClick" :size="size" :close-on-click-modal="false" append-to-body>
        <el-form :inline="true" label-width="68px">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="상품명">
                <el-input v-model="query.itemName" clearable placeholder="상품명"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="상품 코드">
                <el-input class="w200" v-model="query.itemCode" clearable placeholder="상품 코드"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="규격명">
                <el-input class="w200" v-model="query.skuName" clearable placeholder="규격명"></el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="규격 코드">
                <el-input class="w200" v-model="query.barcode" clearable placeholder="규격 코드"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-button type="primary" @click="loadAll">조회</el-button>
            </el-col>
          </el-row>
        </el-form>
            <el-table :data="list" @selection-change="handleSelectionChange" border :row-key="getRowKey" empty-text="등록된 상품이 없습니다." v-loading="loading" ref="skuSelectFormRef" cell-class-name="my-cell">
              <el-table-column type="selection" width="55" :reserve-selection="true" v-if="!singleSelect" :selectable="judgeSelectable"/>
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
              <el-table-column label="가격(위안)" width="160" align="left">
                <template #default="{ row }">
                  <div v-if="row.itemSku.costPrice" class="flex-space-between">
                    <span>원가：</span>
                    <div>{{ (row.itemSku.costPrice || row.itemSku.costPrice === 0) ? row.itemSku.costPrice : '' }}</div>
                  </div>
                  <div v-if="row.itemSku.sellingPrice" class="flex-space-between">
                    <span>판매가：</span>
                    <div>{{ (row.itemSku.sellingPrice || row.itemSku.sellingPrice === 0) ? row.itemSku.sellingPrice : '' }}</div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="중량(kg)" width="160" align="left">
                <template #default="{ row }">
                  <div v-if="row.itemSku.netWeight" class="flex-space-between">
                    <span>순중량：</span>
                    <div>{{ (row.itemSku.netWeight || row.itemSku.netWeight === 0) ? row.itemSku.netWeight : '' }}</div>
                  </div>
                  <div v-if="row.itemSku.grossWeight" class="flex-space-between">
                    <span>총중량：</span>
                    <div>{{ (row.itemSku.grossWeight || row.itemSku.grossWeight === 0) ? row.itemSku.grossWeight : '' }}</div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="길이·너비·높이(cm)" align="right" width="250">
                <template #default="{ row }">
                  <div>{{ getVolumeText(row) }}</div>
                </template>
              </el-table-column>
              <el-table-column label="작업" width="100" v-if="singleSelect" align="right">
                <template #default="{ row }">
                  <el-button link type="primary" @click="handleChooseSku(row)">선택</el-button>
                </template>
              </el-table-column>
            </el-table>
    <el-row>
      <pagination v-show="total > 0" :total="total" :page-sizes="[5, 10, 20, 50]" v-model:limit="pageReq.size" v-model:page="pageReq.page"
                  @pagination="getList" class="mr10"/>
    </el-row>
    <template v-slot:footer>
      <div style="width: 100%;display: flex;justify-content: space-between">
        <span>
          <el-button @click="goCreateItem" icon="Plus">상품 등록</el-button>
          <el-button @click="loadAll" icon="Refresh">새로고침</el-button>
        </span>
        <span>
          <el-button @click="handleCancelClick">취소</el-button>
          <el-button type="primary" @click="handleOkClick" v-if="!singleSelect">확인</el-button>
      </span>
      </div>
    </template>
  </el-drawer>
</template>
<script setup lang="ts" name="SkuSelect">
import {computed, getCurrentInstance, onMounted, reactive, ref} from 'vue';
import {ElForm} from "element-plus";
import {listItemSkuPage} from "@/api/wms/itemSku";
import {useRouter} from "vue-router";
import {useWmsStore} from '@/store/modules/wms'

const { proxy } = getCurrentInstance()

const router = useRouter()
const loading = ref(false)
const deptOptions = ref([]);
const query = reactive({
  itemName: '',
  itemCode: '',
  skuName: '',
  barcode: ''
});
const selectItemSkuVoCheck = ref([])
const skuSelectFormRef = ref(null)
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

const loadAll = () => {
  pageReq.page = 1
  getList()
};
const getRowKey = (row: any) => {
  return row.id;
}
const getList = () => {
  const data = {
    ...query,
    pageNum: pageReq.page,
    pageSize: pageReq.size
  }
  loading.value = true
  listItemSkuPage(data).then((res) => {
    const content = [...res.rows];
    list.value = content.map((it) => ({...it, id: it.skuId, checked: false}));
    total.value = res.total;
  }).then(() => toggleSelection()).finally(() => loading.value = false);
}
const goCreateItem = () => {
  const data = proxy.$router.resolve({path: '/system/itemManage2', query: {openDrawer: true}})
  window.open(data.href, '_blank')
}
// 定义props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: '30%'
  },
  singleSelect:{
    type: Boolean,
    default: false
  },
  selectedSku: {
    type: Array,
    default: []
  }
})

const show = computed(() => {
  return props.modelValue;
})

// 定义事件
const emit = defineEmits<{
  (e: 'handleCancelClick')
  (e: 'handleOkClick', value)
  (e: 'handleSingleOkClick', value)
}>()

function handleCancelClick() {
  emit('handleCancelClick');
  clearQuantity()
}

function handleChooseSku(row) {
  emit('handleSingleOkClick', row);
}

function handleOkClick() {
  emit('handleOkClick', selectItemSkuVoCheck.value);
  clearQuantity()
}
/** 多选框选中数据 */
const handleSelectionChange = (selection) => {
  selectItemSkuVoCheck.value = selection
}

const toggleSelection = () => {
  props.selectedSku.forEach(selected => {
    const index = list.value.findIndex(it => selected.id=== it.id)
    if (index !== -1) {
      skuSelectFormRef.value.toggleRowSelection(list.value[index], true)
    }
  })
}

const judgeSelectable = (row) => {
  if (props.selectedSku.find(selected => selected.id === row.id)) {
    return false;
  }
  return true
}


function clearQuantity() {
  skuSelectFormRef.value.clearSelection()
}

const getVolumeText = (row) => {
  if((row.length || row.length === 0) && (row.width || row.width === 0) && (row.height || row.height === 0)) {
    return row.length + ' * ' + row.width + ' * ' + row.height
  }
  return ((row.length || row.length === 0) ? ('길이：' + row.length) : '')
    + ((row.width || row.width === 0) ? (' 너비：' + row.width) : '')
    + ((row.height || row.height === 0) ? (' 높이：' + row.height) : '')
}
defineExpose({
  getList
})
</script>
<style lang="scss">
.el-table .my-cell {
  vertical-align: top
}
</style>

