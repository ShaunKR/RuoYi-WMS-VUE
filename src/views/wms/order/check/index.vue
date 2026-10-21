<template>
  <div class="app-container">
    <el-card>
      <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="68px">
        <el-form-item label="실사 상태" prop="orderStatus">
          <el-radio-group v-model="queryParams.orderStatus" @change="handleQuery">
            <el-radio-button
              :key="-2"
              :label="-2"
            >
              전체
            </el-radio-button>
            <el-radio-button
              v-for="item in wms_check_status"
              :key="item.value"
              :label="item.value"
            >
              {{ item.label }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="실사 전표 번호" prop="orderNo">
          <el-input
            v-model="queryParams.orderNo"
            placeholder="실사 전표 번호를 입력해 주세요."
            clearable
            @keyup.enter="handleQuery"
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
        <el-col :span="6"><span style="font-size: large">실사 전표</span></el-col>
        <el-col :span="1.5">
          <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
            v-hasPermi="['wms:check:all']"
          >추가</el-button>
        </el-col>
      </el-row>

      <el-table v-loading="loading" :data="checkOrderList" border class="mt20"
                :row-key="getRowKey"
                empty-text="실사 전표가 없습니다."
                cell-class-name="vertical-top-cell"
      >
        <el-table-column label="전표 번호" align="left" prop="orderNo" />
        <el-table-column label="창고" align="left" width="200">
          <template #default="{ row }">
            <div>{{ useWmsStore().warehouseMap.get(row.warehouseId)?.warehouseName }}</div>
          </template>
        </el-table-column>
        <el-table-column label="실사 상태" align="center" prop="orderStatus" width="120">
          <template #default="{ row }">
            <dict-tag :options="wms_check_status" :value="row.orderStatus" />
          </template>
        </el-table-column>
        <el-table-column label="재고 차이" align="right">
          <template #default="{ row }">
            <el-statistic :value="Number(row.totalQuantity)" :precision="0"/>
          </template>
        </el-table-column>
        <el-table-column label="처리 일시" align="left" width="200">
          <template #default="{ row }">
            <div>등록：{{ parseTime(row.createTime, '{mm}-{dd} {hh}:{ii}') }}</div>
            <div>수정：{{ parseTime(row.updateTime, '{mm}-{dd} {hh}:{ii}') }}</div>
          </template>
        </el-table-column>
        <el-table-column label="처리자" align="left">
          <template #default="{ row }">
            <div>{{ row.createBy }}</div>
            <div v-if="row.updateBy">{{ row.updateBy }}</div>
          </template>
        </el-table-column>

        <el-table-column label="비고" prop="remark" />
        <el-table-column label="작업" align="right" class-name="small-padding fixed-width" width="120">
          <template #default="scope">
            <div>
              <el-popover
                placement="left"
                title="안내"
                :width="300"
                trigger="hover"
                :disabled="scope.row.orderStatus === 0"
                :content="'실사 전표【' + scope.row.orderNo + '】 상태: ' + (scope.row.orderStatus === 1 ? '실사 완료' : '무효 처리') + '，상태에서는 수정할 수 없습니다.' "
              >
                <template #reference>
                  <el-button link type="primary" @click="handleUpdate(scope.row)" v-hasPermi="['wms:check:all']" :disabled="[-1, 1].includes(scope.row.orderStatus)">수정</el-button>
                </template>
              </el-popover>
              <el-button link type="primary" @click="handleGoDetail(scope.row)" v-hasPermi="['wms:check:all']">보기</el-button>
            </div>
            <div class="mt10">
              <el-popover
                placement="left"
                title="안내"
                :width="300"
                trigger="hover"
                :disabled="[-1, 0].includes(scope.row.orderStatus)"
                :content="'실사 전표【' + scope.row.orderNo + '】실사가 완료되어 삭제할 수 없습니다.' "
              >
                <template #reference>
                  <el-button link type="danger" @click="handleDelete(scope.row)" v-hasPermi="['wms:check:all']" :disabled="scope.row.orderStatus === 1">삭제</el-button>
                </template>
              </el-popover>
              <el-button link type="primary" @click="handlePrint(scope.row)" v-hasPermi="['wms:check:all']">인쇄</el-button>
            </div>
          </template>
        </el-table-column>
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
    <check-order-detail
      ref="checkOrderDetailRef"
      :model-value="watchDetailObj.show"
      :order-no="watchDetailObj.orderNo"
      @handle-cancel-click="watchDetailObj.show = false"
    />
  </div>
</template>

<script setup name="CheckOrder">
import {listCheckOrder, delCheckOrder, getCheckOrder} from "@/api/wms/checkOrder";
import {listByCheckOrderId} from "@/api/wms/checkOrderDetail";
import {getCurrentInstance, reactive, ref, toRefs} from "vue";
import {useWmsStore} from "../../../../store/modules/wms";
import {ElMessageBox} from "element-plus";
import checkPanel from "@/components/PrintTemplate/check-panel";
import CheckOrderDetail from "@/views/wms/order/check/CheckOrderDetail.vue";
const { proxy } = getCurrentInstance();
const {wms_check_status} = proxy.useDict("wms_check_status");
const checkOrderList = ref([]);
const open = ref(false);
const buttonLoading = ref(false);
const loading = ref(true);
const ids = ref([]);
const total = ref(0);
const title = ref("");
const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    orderNo: undefined,
    orderStatus: -2,
  },
});
const watchDetailObj = ref({
  show: false,
  orderNo: null
})
const checkOrderDetailRef = ref(null)
const { queryParams } = toRefs(data);

/** 조회입고 전표列表 */
function getList() {
  loading.value = true;
  const query = {...queryParams.value}
  if (query.orderStatus === -2) {
    query.orderStatus = null
  }
  listCheckOrder(query).then(response => {
    checkOrderList.value = response.rows;
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

/** 추가버튼작업 */
function handleAdd() {
  proxy.$router.push({ path: "/checkOrderEdit" });
}

/** 삭제버튼작업 */
function handleDelete(row) {
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('삭제 확인:【실사 전표【' + row.orderNo + '】을(를) 삭제하시겠습니까?').then(function() {
    loading.value = true;
    return delCheckOrder(_ids);
  }).then(() => {
    proxy.$modal.msgSuccess("삭제되었습니다.");
  }).finally(() => {
    loading.value = false;
    getList();
  });
}

function handleUpdate(row) {
  proxy.$router.push({ path: "/checkOrderEdit",  query: { id: row.id } });
}

function handleGoDetail(row) {
  watchDetailObj.value.orderNo = row.orderNo
  checkOrderDetailRef.value.setCheckOrderId(row.id)
  watchDetailObj.value.show = true
  checkOrderDetailRef.value.handleQuery()
}

/** 내보내기버튼작업 */
async function handlePrint(row) {
  const res = await getCheckOrder(row.id)
  const checkOrder = res.data
  let table = []
  if (checkOrder.details?.length) {
    table = checkOrder.details.map(detail => {
      return {
        itemName: detail.item.itemName,
        skuName: detail.itemSku.skuName,
        quantity: Number(detail.quantity).toFixed(0),
        profitAndLoss: Number(detail.checkQuantity - detail.quantity).toFixed(0),
        checkQuantity: Number(detail.checkQuantity).toFixed(0)
      }
    })
  }
  const printData = {
    orderNo: checkOrder.orderNo,
    orderStatus: proxy.selectDictLabel(wms_check_status.value, checkOrder.orderStatus),
    warehouseName: useWmsStore().warehouseMap.get(checkOrder.warehouseId)?.warehouseName,
    totalQuantity: Number(checkOrder.totalQuantity).toFixed(0),
    createBy: checkOrder.createBy,
    createTime: proxy.parseTime(checkOrder.createTime, '{mm}-{dd} {hh}:{ii}'),
    updateBy: checkOrder.updateBy,
    updateTime: proxy.parseTime(checkOrder.updateTime, '{mm}-{dd} {hh}:{ii}'),
    remark: checkOrder.remark,
    table
  }
  let printTemplate = new proxy.$hiprint.PrintTemplate({template: checkPanel})
  printTemplate.print(printData, {}, {
    styleHandler: () => {
      let css = '<link href="https://cyl-press.oss-cn-shenzhen.aliyuncs.com/print-lock.css" media="print" rel="stylesheet">';
      return css
    }
  })
}

function getRowKey(row) {
  return row.id
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
