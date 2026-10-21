<template>
  <div class="app-container">
    <el-card>
      <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="68px">
        <el-form-item label="전표 유형" prop="orderType">
          <el-radio-group v-model="queryParams.orderType" @change="handleQuery">
            <el-radio-button
              :key="-1"
              :label="-1"
            >
              전체
            </el-radio-button>
            <el-radio-button
              v-for="item in wms_inventory_history_type"
              :key="item.value"
              :label="item.value"
            >
              {{ item.label }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="창고" prop="warehouseId">
          <el-select style="width: 100%" v-model="queryParams.warehouseId" placeholder="창고를 선택해 주세요."
                     filterable clearable>
            <el-option v-for="item in useWmsStore().warehouseList" :key="item.id" :label="item.warehouseName"
                       :value="item.id"/>
          </el-select>
        </el-form-item>
        <el-form-item label="처리 전표 번호" prop="orderNo">
          <el-input v-model="queryParams.orderNo" clearable placeholder="처리 전표 번호를 입력해 주세요."></el-input>
        </el-form-item>

        <el-form-item label="상품명" prop="itemName">
          <el-input v-model="queryParams.itemName" clearable placeholder="상품명을 입력해 주세요."></el-input>
        </el-form-item>
        <el-form-item label="상품 코드" prop="itemCode">
          <el-input v-model="queryParams.itemCode" clearable placeholder="상품 코드를 입력해 주세요."></el-input>
        </el-form-item>
        <el-form-item label="규격명" prop="skuName">
          <el-input v-model="queryParams.skuName" clearable placeholder="규격명을 입력해 주세요."></el-input>
        </el-form-item>
        <el-form-item label="규격 코드" prop="skuCode">
          <el-input v-model="queryParams.skuCode" clearable placeholder="규격 코드를 입력해 주세요."></el-input>
        </el-form-item>
        <el-form-item label="처리 일시" prop="createTimeRange">
          <el-date-picker
            v-model="queryParams.createTimeRange"
            type="datetimerange"
            range-separator="~"
            value-format="YYYY-MM-DD HH:mm:ss"
            format="YYYY-MM-DD HH:mm:ss"
            :default-time="defaultTime"
            start-placeholder="시작 일시"
            end-placeholder="종료 일시"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">검색</el-button>
          <el-button icon="Refresh" @click="resetQuery">초기화</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="mt20">
      <el-row :gutter="10" class="mb8" type="flex" justify="space-between">
        <el-col :span="6"><span style="font-size: large">재고 이력</span></el-col>
      </el-row>
      <el-table v-loading="loading" :data="inventoryHistoryList" border class="mt20" empty-text="재고 이력이 없습니다." cell-class-name="vertical-top-cell">
        <el-table-column label="처리 전표 번호" prop="orderNo"/>
        <el-table-column label="상품 정보">
          <template #default="{ row }">
            <div>{{ row.item.itemName }}</div>
            <div v-if="row.item.itemCode">상품 코드：{{ row.item.itemCode }}</div>
          </template>
        </el-table-column>
        <el-table-column label="규격 정보">
          <template #default="{ row }">
            <div>{{ row.itemSku.skuName }}</div>
            <div v-if="row.itemSku.skuCode">규격 코드：{{ row.itemSku.skuCode }}</div>
          </template>
        </el-table-column>
        <el-table-column label="전표 유형" align="center" width="100">
          <template #default="{ row }">
            <dict-tag :options="wms_inventory_history_type" :value="row.orderType"/>
          </template>
        </el-table-column>
        <el-table-column label="창고">
          <template #default="{ row }">
            <div>{{ useWmsStore().warehouseMap.get(row.warehouseId)?.warehouseName }}</div>
          </template>
        </el-table-column>
        <el-table-column label="변경 전" align="right">
          <template #default="{ row }">
            <div >
              <el-statistic :value="Number(row.beforeQuantity)" :precision="0" v-if="row.beforeQuantity"/>
              <span v-else>-</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="변경 후" align="right">
          <template #default="{ row }">
            <div>
              <el-statistic :value="Number(row.afterQuantity)" :precision="0" v-if="row.afterQuantity"/>
              <span v-else>-</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="수량 / 금액(위안)">
          <template #default="{ row }">
            <div class="flex-space-between">
              <div>수량：</div>
              <el-statistic :value="Number(row.quantity)" :precision="0"/>
            </div>
            <div class="flex-space-between" v-if="row.amount || row.amount === 0">
              <div>금액：</div>
              <el-statistic :value="Number(row.amount)" :precision="2"/>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="처리 일시" prop="createTime"/>
      </el-table>

      <el-row>
        <pagination
          v-show="total>0"
          :total="total"
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          @pagination="getList"
        />
      </el-row>

    </el-card>
  </div>
</template>

<script setup name="InventoryHistory">
import {listInventoryHistory} from "@/api/wms/inventoryHistory";
import {getCurrentInstance, reactive, ref} from "vue";
import {useWmsStore} from '@/store/modules/wms'
const defaultTime = reactive([new Date(0,0,0,0,0,0), new Date(0,0,0,23,59,59)])
const {proxy} = getCurrentInstance();
const {wms_inventory_history_type} = proxy.useDict('wms_inventory_history_type');

const inventoryHistoryList = ref([]);
const loading = ref(true);
const total = ref(0);
const queryRef = ref(null)
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  orderType: -1,
  orderNo: undefined,
  itemName: undefined,
  itemCode: undefined,
  skuName: undefined,
  skuCode: undefined,
  warehouseId: undefined,
})

/** 조회거래처列表 */
function getList() {
  const query = {...queryParams.value}
  if (query.orderType === -1) {
    query.orderType = null
  }
  if (query.createTimeRange) {
    query.startTime = query.createTimeRange[0]
    query.endTime = query.createTimeRange[1]
  }
  loading.value = true;
  listInventoryHistory(query).then(response => {
    inventoryHistoryList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

/** 검색버튼작업 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 초기화버튼작업 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

getList();
</script>
<style lang="scss">
.el-statistic__content {
  font-size: 14px;
}
.el-table .vertical-top-cell {
  vertical-align: top
}
</style>
