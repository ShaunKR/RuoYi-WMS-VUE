<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
        <el-form-item label="작업주소" prop="operIp">
          <el-input
            v-model="queryParams.operIp"
            placeholder="입력해 주세요:작업주소"
            clearable
            style="width: 240px;"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="시스템 모듈" prop="title">
            <el-input
               v-model="queryParams.title"
               placeholder="입력해 주세요:시스템 모듈"
               clearable
               style="width: 240px;"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="처리자" prop="operName">
            <el-input
               v-model="queryParams.operName"
               placeholder="입력해 주세요:처리자"
               clearable
               style="width: 240px;"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="유형" prop="businessType">
            <el-select
               v-model="queryParams.businessType"
               placeholder="작업유형"
               clearable
               style="width: 240px"
            >
               <el-option
                  v-for="dict in sys_oper_type"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
               />
            </el-select>
         </el-form-item>
         <el-form-item label="상태" prop="status">
            <el-select
               v-model="queryParams.status"
               placeholder="작업상태"
               clearable
               style="width: 240px"
            >
               <el-option
                  v-for="dict in sys_common_status"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
               />
            </el-select>
         </el-form-item>
         <el-form-item label="처리 일시" style="width: 308px">
            <el-date-picker
               v-model="dateRange"
               value-format="YYYY-MM-DD HH:mm:ss"
               type="daterange"
               range-separator="-"
               start-placeholder="시작일"
               end-placeholder="종료일"
               :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
            ></el-date-picker>
         </el-form-item>
         <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">검색</el-button>
            <el-button icon="Refresh" @click="resetQuery">초기화</el-button>
         </el-form-item>
      </el-form>

      <el-row :gutter="10" class="mb8">
         <el-col :span="1.5">
            <el-button
               type="danger"
               plain
               icon="Delete"
               :disabled="multiple"
               @click="handleDelete"
               v-hasPermi="['monitor:operlog:remove']"
            >삭제</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="danger"
               plain
               icon="Delete"
               @click="handleClean"
               v-hasPermi="['monitor:operlog:remove']"
            >비우기</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="warning"
               plain
               icon="Download"
               @click="handleExport"
               v-hasPermi="['monitor:operlog:export']"
            >내보내기</el-button>
         </el-col>
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table ref="operlogRef" v-loading="loading" :data="operlogList" @selection-change="handleSelectionChange" :default-sort="defaultSort" @sort-change="handleSortChange">
         <el-table-column type="selection" width="50" align="center" />
         <el-table-column label="로그 번호" align="center" prop="operId" />
         <el-table-column label="시스템 모듈" align="center" prop="title" :show-overflow-tooltip="true" />
         <el-table-column label="작업유형" align="center" prop="businessType">
            <template #default="scope">
               <dict-tag :options="sys_oper_type" :value="scope.row.businessType" />
            </template>
         </el-table-column>
         <el-table-column label="요청 방식" align="center" prop="requestMethod" />
         <el-table-column label="처리자" align="center" width="110" prop="operName" :show-overflow-tooltip="true" sortable="custom" :sort-orders="['descending', 'ascending']" />
         <el-table-column label="부서" align="center" prop="deptName" width="130" :show-overflow-tooltip="true" />
         <el-table-column label="작업주소" align="center" prop="operIp" width="130" :show-overflow-tooltip="true" />
         <el-table-column label="작업위치" align="center" prop="operLocation" :show-overflow-tooltip="true" />
        <el-table-column label="작업상태" align="center" prop="status">
            <template #default="scope">
               <dict-tag :options="sys_common_status" :value="scope.row.status" />
            </template>
         </el-table-column>
         <el-table-column label="작업일시" align="center" prop="operTime" width="180" sortable="custom" :sort-orders="['descending', 'ascending']">
            <template #default="scope">
               <span>{{ parseTime(scope.row.operTime) }}</span>
            </template>
         </el-table-column>
         <el-table-column label="소요 시간" align="center" prop="costTime" width="110" :show-overflow-tooltip="true" sortable="custom" :sort-orders="['descending', 'ascending']">
            <template #default="scope">
               <span>{{ scope.row.costTime }}밀리초</span>
            </template>
         </el-table-column>
         <el-table-column label="작업" align="center" class-name="small-padding fixed-width">
            <template #default="scope">
               <el-button link type="primary" icon="View" @click="handleView(scope.row, scope.index)" v-hasPermi="['monitor:operlog:query']">상세</el-button>
            </template>
         </el-table-column>
      </el-table>

      <pagination
         v-show="total > 0"
         :total="total"
         v-model:page="queryParams.pageNum"
         v-model:limit="queryParams.pageSize"
         @pagination="getList"
      />

      <!-- 操作日志详细 -->
      <el-dialog title="작업 로그상세" v-model="open" width="700px" append-to-body>
         <el-form :model="form" label-width="100px">
            <el-row>
               <el-col :span="24">
                  <el-form-item
                    label="로그인 정보："
                  >{{ form.operName }} / {{form.deptName}} / {{ form.operIp }} / {{ form.operLocation }}</el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="요청 정보：">{{ form.requestMethod }} {{form.operUrl }}</el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="작업모듈：">{{ form.title }} / {{ typeFormat(form) }}</el-form-item>
               </el-col>
               <el-col :span="24">
                  <el-form-item label="작업메서드：">{{ form.method }}</el-form-item>
               </el-col>
               <el-col :span="24">
                  <el-form-item label="요청 매개변수：">{{ form.operParam }}</el-form-item>
               </el-col>
               <el-col :span="24">
                  <el-form-item label="돌아가기매개변수：">{{ form.jsonResult }}</el-form-item>
               </el-col>
               <el-col :span="6">
                  <el-form-item label="작업상태：">
                     <div v-if="form.status === 0">정상</div>
                     <div v-else-if="form.status === 1">실패</div>
                  </el-form-item>
               </el-col>
               <el-col :span="8">
                  <el-form-item label="소요 시간：">{{ form.costTime }}밀리초</el-form-item>
               </el-col>
               <el-col :span="10">
                  <el-form-item label="처리 일시：">{{ parseTime(form.operTime) }}</el-form-item>
               </el-col>
               <el-col :span="24">
                  <el-form-item label="오류정보：" v-if="form.status === 1">{{ form.errorMsg }}</el-form-item>
               </el-col>
            </el-row>
         </el-form>
         <template #footer>
            <div class="dialog-footer">
               <el-button @click="open = false">닫기</el-button>
            </div>
         </template>
      </el-dialog>
   </div>
</template>

<script setup name="Operlog">
import { list, delOperlog, cleanOperlog } from "@/api/monitor/operlog";

const { proxy } = getCurrentInstance();
const { sys_oper_type, sys_common_status } = proxy.useDict("sys_oper_type","sys_common_status");

const operlogList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const dateRange = ref([]);
const defaultSort = ref({ prop: "operTime", order: "descending" });

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    operIp: undefined,
    title: undefined,
    operName: undefined,
    businessType: undefined,
    status: undefined
  }
});

const { queryParams, form } = toRefs(data);

/** 조회로그인 로그 */
function getList() {
  loading.value = true;
  list(proxy.addDateRange(queryParams.value, dateRange.value)).then(response => {
    operlogList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}
/** 작업 로그유형字典翻译 */
function typeFormat(row, column) {
  return proxy.selectDictLabel(sys_oper_type.value, row.businessType);
}
/** 검색버튼작업 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}
/** 초기화버튼작업 */
function resetQuery() {
  dateRange.value = [];
  proxy.resetForm("queryRef");
  queryParams.value.pageNum = 1;
  proxy.$refs["operlogRef"].sort(defaultSort.value.prop, defaultSort.value.order);
}
/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.operId);
  multiple.value = !selection.length;
}
/** 정렬触发事件 */
function handleSortChange(column, prop, order) {
  queryParams.value.orderByColumn = column.prop;
  queryParams.value.isAsc = column.order;
  getList();
}
/** 상세버튼작업 */
function handleView(row) {
  open.value = true;
  form.value = row;
}
/** 삭제버튼작업 */
function handleDelete(row) {
  const operIds = row.operId || ids.value;
  proxy.$modal.confirm('삭제하시겠습니까:로그 번호: "' + operIds + '" 항목을 처리하시겠습니까?').then(function () {
    return delOperlog(operIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("삭제되었습니다.");
  }).catch(() => {});
}
/** 비우기버튼작업 */
function handleClean() {
  proxy.$modal.confirm("모두 비우시겠습니까:작업 로그항목?").then(function () {
    return cleanOperlog();
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("비우기성공");
  }).catch(() => {});
}
/** 내보내기버튼작업 */
function handleExport() {
  proxy.download("monitor/operlog/export",{
    ...queryParams.value,
  }, `config_${new Date().getTime()}.xlsx`);
}

getList();
</script>
