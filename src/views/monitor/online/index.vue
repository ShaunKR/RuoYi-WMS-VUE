<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" :inline="true">
         <el-form-item label="로그인주소" prop="ipaddr">
            <el-input
               v-model="queryParams.ipaddr"
               placeholder="입력해 주세요:로그인주소"
               clearable
               style="width: 200px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="사용자 이름" prop="userName">
            <el-input
               v-model="queryParams.userName"
               placeholder="입력해 주세요:사용자 이름"
               clearable
               style="width: 200px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">검색</el-button>
            <el-button icon="Refresh" @click="resetQuery">초기화</el-button>
         </el-form-item>
      </el-form>
      <el-table
         v-loading="loading"
         :data="onlineList.slice((pageNum - 1) * pageSize, pageNum * pageSize)"
         style="width: 100%;"
      >
         <el-table-column label="번호" width="50" type="index" align="center">
            <template #default="scope">
               <span>{{ (pageNum - 1) * pageSize + scope.$index + 1 }}</span>
            </template>
         </el-table-column>
         <el-table-column label="세션코드" align="center" prop="tokenId" :show-overflow-tooltip="true" />
         <el-table-column label="로그인이름" align="center" prop="userName" :show-overflow-tooltip="true" />
         <el-table-column label="소속 부서" align="center" prop="deptName" :show-overflow-tooltip="true" />
         <el-table-column label="호스트" align="center" prop="ipaddr" :show-overflow-tooltip="true" />
         <el-table-column label="접속 위치" align="center" prop="loginLocation" :show-overflow-tooltip="true" />
         <el-table-column label="작업시스템" align="center" prop="os" :show-overflow-tooltip="true" />
         <el-table-column label="브라우저" align="center" prop="browser" :show-overflow-tooltip="true" />
         <el-table-column label="로그인 일시" align="center" prop="loginTime" width="180">
            <template #default="scope">
               <span>{{ parseTime(scope.row.loginTime) }}</span>
            </template>
         </el-table-column>
         <el-table-column label="작업" align="center" class-name="small-padding fixed-width">
            <template #default="scope">
               <el-button link type="primary" icon="Delete" @click="handleForceLogout(scope.row)" v-hasPermi="['monitor:online:forceLogout']">강제 로그아웃</el-button>
            </template>
         </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="pageNum" v-model:limit="pageSize" />
   </div>
</template>

<script setup name="Online">
import { forceLogout, list as initData } from "@/api/monitor/online";

const { proxy } = getCurrentInstance();

const onlineList = ref([]);
const loading = ref(true);
const total = ref(0);
const pageNum = ref(1);
const pageSize = ref(10);

const queryParams = ref({
  ipaddr: undefined,
  userName: undefined
});

/** 조회로그인 로그列表 */
function getList() {
  loading.value = true;
  initData(queryParams.value).then(response => {
    onlineList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}
/** 검색버튼작업 */
function handleQuery() {
  pageNum.value = 1;
  getList();
}
/** 초기화버튼작업 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}
/** 강제 로그아웃버튼작업 */
function handleForceLogout(row) {
    proxy.$modal.confirm('확인하시겠습니까:강제 로그아웃이름: "' + row.userName + '" 사용자?').then(function () {
  return forceLogout(row.tokenId);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("삭제되었습니다.");
  }).catch(() => {});
}

getList();
</script>
