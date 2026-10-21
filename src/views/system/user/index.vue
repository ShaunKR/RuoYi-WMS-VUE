<template>
   <div class="app-container">
      <el-row :gutter="20">
         <!--部门数据-->
         <el-col :span="4" :xs="24">
            <div class="head-container">
               <el-input
                  v-model="deptName"
                  placeholder="입력해 주세요:부서명"
                  clearable
                  prefix-icon="Search"
                  style="margin-bottom: 20px"
               />
            </div>
            <div class="head-container">
               <el-tree
                  :data="deptOptions"
                  :props="{ label: 'label', children: 'children' }"
                  :expand-on-click-node="false"
                  :filter-node-method="filterNode"
                  ref="deptTreeRef"
                  node-key="id"
                  highlight-current
                  default-expand-all
                  @node-click="handleNodeClick"
               />
            </div>
         </el-col>
         <!--用户数据-->
         <el-col :span="20" :xs="24">
            <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
               <el-form-item label="사용자 이름" prop="userName">
                  <el-input
                     v-model="queryParams.userName"
                     placeholder="입력해 주세요:사용자 이름"
                     clearable
                     style="width: 240px"
                     @keyup.enter="handleQuery"
                  />
               </el-form-item>
               <el-form-item label="휴대전화 번호" prop="phonenumber">
                  <el-input
                     v-model="queryParams.phonenumber"
                     placeholder="휴대전화 번호를 입력해 주세요."
                     clearable
                     style="width: 240px"
                     @keyup.enter="handleQuery"
                  />
               </el-form-item>
               <el-form-item label="상태" prop="status">
                  <el-select
                     v-model="queryParams.status"
                     placeholder="사용자 상태"
                     clearable
                     style="width: 240px"
                  >
                     <el-option
                        v-for="dict in sys_normal_disable"
                        :key="dict.value"
                        :label="dict.label"
                        :value="dict.value"
                     />
                  </el-select>
               </el-form-item>
               <el-form-item label="등록 일시" style="width: 308px;">
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
                     type="primary"
                     plain
                     icon="Plus"
                     @click="handleAdd"
                     v-hasPermi="['system:user:add']"
                  >추가</el-button>
               </el-col>
               <el-col :span="1.5">
                  <el-button
                     type="success"
                     plain
                     icon="Edit"
                     :disabled="single"
                     @click="handleUpdate"
                     v-hasPermi="['system:user:edit']"
                  >수정</el-button>
               </el-col>
               <el-col :span="1.5">
                  <el-button
                     type="danger"
                     plain
                     icon="Delete"
                     :disabled="multiple"
                     @click="handleDelete"
                     v-hasPermi="['system:user:remove']"
                  >삭제</el-button>
               </el-col>
               <el-col :span="1.5">
                  <el-button
                     type="info"
                     plain
                     icon="Upload"
                     @click="handleImport"
                     v-hasPermi="['system:user:import']"
                  >가져오기</el-button>
               </el-col>
               <el-col :span="1.5">
                  <el-button
                     type="warning"
                     plain
                     icon="Download"
                     @click="handleExport"
                     v-hasPermi="['system:user:export']"
                  >내보내기</el-button>
               </el-col>
               <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" :columns="columns"></right-toolbar>
            </el-row>

            <el-table v-loading="loading" :data="userList" @selection-change="handleSelectionChange">
               <el-table-column type="selection" width="50" align="center" />
               <el-table-column label="사용자 번호" align="center" key="userId" prop="userId" v-if="columns[0].visible" />
               <el-table-column label="사용자 이름" align="center" key="userName" prop="userName" v-if="columns[1].visible" :show-overflow-tooltip="true" />
               <el-table-column label="사용자 별명" align="center" key="nickName" prop="nickName" v-if="columns[2].visible" :show-overflow-tooltip="true" />
               <el-table-column label="부서" align="center" key="deptName" prop="deptName" v-if="columns[3].visible" :show-overflow-tooltip="true" />
               <el-table-column label="휴대전화 번호" align="center" key="phonenumber" prop="phonenumber" v-if="columns[4].visible" width="120" />
               <el-table-column label="상태" align="center" key="status" v-if="columns[5].visible">
                  <template #default="scope">
                     <el-switch
                        v-model="scope.row.status"
                        active-value="1"
                        inactive-value="0"
                        @change="handleStatusChange(scope.row)"
                     ></el-switch>
                  </template>
               </el-table-column>
               <el-table-column label="등록 일시" align="center" prop="createTime" v-if="columns[6].visible" width="160">
                  <template #default="scope">
                     <span>{{ parseTime(scope.row.createTime) }}</span>
                  </template>
               </el-table-column>
               <el-table-column label="작업" align="center" width="150" class-name="small-padding fixed-width">
                  <template #default="scope">
                     <el-tooltip content="수정" placement="top" v-if="scope.row.userId !== 1">
                        <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:user:edit']"></el-button>
                     </el-tooltip>
                     <el-tooltip content="삭제" placement="top" v-if="scope.row.userId !== 1">
                        <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:user:remove']"></el-button>
                     </el-tooltip>
                     <el-tooltip content="비밀번호 초기화" placement="top" v-if="scope.row.userId !== 1">
                         <el-button link type="primary" icon="Key" @click="handleResetPwd(scope.row)" v-hasPermi="['system:user:resetPwd']"></el-button>
                     </el-tooltip>
                     <el-tooltip content="역할 할당" placement="top" v-if="scope.row.userId !== 1">
                        <el-button link type="primary" icon="CircleCheck" @click="handleAuthRole(scope.row)" v-hasPermi="['system:user:edit']"></el-button>
                     </el-tooltip>
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
         </el-col>
      </el-row>

      <!-- 添加或修改用户配置对话框 -->
      <el-dialog :title="title" v-model="open" width="600px" append-to-body>
         <el-form :model="form" :rules="rules" ref="userRef" label-width="80px">
            <el-row>
               <el-col :span="12">
                  <el-form-item label="사용자 별명" prop="nickName">
                     <el-input v-model="form.nickName" placeholder="입력해 주세요:사용자 별명" maxlength="30" />
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="소속 부서" prop="deptId">
                     <el-tree-select
                        v-model="form.deptId"
                        :data="deptOptions"
                        :props="{ value: 'id', label: 'label', children: 'children' }"
                        value-key="id"
                        placeholder="선택해 주세요:소속 부서"
                        check-strictly
                     />
                  </el-form-item>
               </el-col>
            </el-row>
            <el-row>
               <el-col :span="12">
                  <el-form-item label="휴대전화 번호" prop="phonenumber">
                     <el-input v-model="form.phonenumber" placeholder="휴대전화 번호를 입력해 주세요." maxlength="11" />
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="이메일" prop="email">
                     <el-input v-model="form.email" placeholder="입력해 주세요:이메일" maxlength="50" />
                  </el-form-item>
               </el-col>
            </el-row>
            <el-row>
               <el-col :span="12">
                  <el-form-item v-if="form.userId == undefined" label="사용자 이름" prop="userName">
                     <el-input v-model="form.userName" placeholder="입력해 주세요:사용자 이름" maxlength="30" />
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item v-if="form.userId == undefined" label="사용자 비밀번호" prop="password">
                     <el-input v-model="form.password" placeholder="입력해 주세요:사용자 비밀번호" type="password" maxlength="20" show-password />
                  </el-form-item>
               </el-col>
            </el-row>
            <el-row>
               <el-col :span="12">
                  <el-form-item label="사용자 성별">
                     <el-select v-model="form.sex" placeholder="선택해 주세요:">
                        <el-option
                           v-for="dict in sys_user_sex"
                           :key="dict.value"
                           :label="dict.label"
                           :value="dict.value"
                        ></el-option>
                     </el-select>
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="상태">
                     <el-radio-group v-model="form.status">
                        <el-radio
                           v-for="dict in sys_normal_disable"
                           :key="dict.value"
                           :label="dict.value"
                        >{{ dict.label }}</el-radio>
                     </el-radio-group>
                  </el-form-item>
               </el-col>
            </el-row>
            <el-row>
               <el-col :span="12">
                  <el-form-item label="직책">
                     <el-select v-model="form.postIds" multiple placeholder="선택해 주세요:">
                        <el-option
                           v-for="item in postOptions"
                           :key="item.postId"
                           :label="item.postName"
                           :value="item.postId"
                           :disabled="item.status == 0"
                        ></el-option>
                     </el-select>
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="역할">
                     <el-select v-model="form.roleIds" multiple placeholder="선택해 주세요:">
                        <el-option
                           v-for="item in roleOptions"
                           :key="item.roleId"
                           :label="item.roleName"
                           :value="item.roleId"
                           :disabled="item.status == 0"
                        ></el-option>
                     </el-select>
                  </el-form-item>
               </el-col>
            </el-row>
            <el-row>
               <el-col :span="24">
                  <el-form-item label="비고">
                     <el-input v-model="form.remark" type="textarea" placeholder="내용을 입력해 주세요."></el-input>
                  </el-form-item>
               </el-col>
            </el-row>
         </el-form>
         <template #footer>
            <div class="dialog-footer">
               <el-button type="primary" @click="submitForm">확인</el-button>
               <el-button @click="cancel">취소</el-button>
            </div>
         </template>
      </el-dialog>

      <!-- 用户导入对话框 -->
      <el-dialog :title="upload.title" v-model="upload.open" width="400px" append-to-body>
         <el-upload
            ref="uploadRef"
            :limit="1"
            accept=".xlsx, .xls"
            :headers="upload.headers"
            :action="upload.url + '?updateSupport=' + upload.updateSupport"
            :disabled="upload.isUploading"
            :on-progress="handleFileUploadProgress"
            :on-success="handleFileSuccess"
            :auto-upload="false"
            drag
         >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">파일을 이곳으로 끌어오거나<em>업로드하기</em></div>
            <template #tip>
               <div class="el-upload__tip text-center">
                  <div class="el-upload__tip">
                     <el-checkbox v-model="upload.updateSupport" />기존 사용자 정보 덮어쓰기
                  </div>
                  <span>허용된 가져오기 형식:xls、xlsx형식 파일。</span>
                  <el-link type="primary" :underline="false" style="font-size:12px;vertical-align: baseline;" @click="importTemplate">양식 다운로드</el-link>
               </div>
            </template>
         </el-upload>
         <template #footer>
            <div class="dialog-footer">
               <el-button type="primary" @click="submitFileForm">확인</el-button>
               <el-button @click="upload.open = false">취소</el-button>
            </div>
         </template>
      </el-dialog>
   </div>
</template>

<script setup name="User">
import { getToken } from "@/utils/auth";
import { changeUserStatus, listUser, resetUserPwd, delUser, getUser, updateUser, addUser, deptTreeSelect } from "@/api/system/user";

const router = useRouter();
const { proxy } = getCurrentInstance();
const { sys_normal_disable, sys_user_sex } = proxy.useDict("sys_normal_disable", "sys_user_sex");

const userList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const dateRange = ref([]);
const deptName = ref("");
const deptOptions = ref(undefined);
const initPassword = ref(undefined);
const postOptions = ref([]);
const roleOptions = ref([]);
/*** 사용자 가져오기매개변수 */
const upload = reactive({
  // 是否显示弹出层（用户导入）
  open: false,
  // 弹出层标题（用户导入）
  title: "",
  // 是否禁用上传
  isUploading: false,
  // 是否更新已经存在的用户数据
  updateSupport: 0,
  // 设置上传的请求头部
  headers: { Authorization: "Bearer " + getToken() },
  // 上传的地址
  url: import.meta.env.VITE_APP_BASE_API + "/system/user/importData"
});
// 列显隐信息
const columns = ref([
  { key: 0, label: `사용자 번호`, visible: true },
  { key: 1, label: `사용자 이름`, visible: true },
  { key: 2, label: `사용자 별명`, visible: true },
  { key: 3, label: `부서`, visible: true },
  { key: 4, label: `휴대전화 번호`, visible: true },
  { key: 5, label: `상태`, visible: true },
  { key: 6, label: `등록 일시`, visible: true }
]);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    userName: undefined,
    phonenumber: undefined,
    status: undefined,
    deptId: undefined
  },
  rules: {
    userName: [{ required: true, message: "사용자 이름을 입력해 주세요.", trigger: "blur" }, { min: 2, max: 20, message: "사용자 이름 허용 길이: 2 ~ 20 사이", trigger: "blur" }],
    nickName: [{ required: true, message: "사용자 별명항목은 필수입니다.", trigger: "blur" }],
    password: [{ required: true, message: "비밀번호를 입력해 주세요.", trigger: "blur" }, { min: 5, max: 20, message: "사용자 비밀번호 허용 길이: 5 ~ 20 사이", trigger: "blur" }],
    email: [{ type: "email", message: "올바른 이메일 주소를 입력해 주세요.", trigger: ["blur", "change"] }],
    phonenumber: [{ pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: "올바른 휴대전화 번호를 입력해 주세요.", trigger: "blur" }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 通过条件过滤节点  */
const filterNode = (value, data) => {
  if (!value) return true;
  return data.label.indexOf(value) !== -1;
};
/** 根据이름筛选부서树 */
watch(deptName, val => {
  proxy.$refs["deptTreeRef"].filter(val);
});
/** 조회부서下拉树结构 */
function getDeptTree() {
  deptTreeSelect().then(response => {
    deptOptions.value = response.data;
  });
};
/** 조회사용자列表 */
function getList() {
  loading.value = true;
  listUser(proxy.addDateRange(queryParams.value, dateRange.value)).then(res => {
    loading.value = false;
    userList.value = res.rows;
    total.value = res.total;
  });
};
/** 节点单击事件 */
function handleNodeClick(data) {
  queryParams.value.deptId = data.id;
  handleQuery();
};
/** 검색버튼작업 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
};
/** 초기화버튼작업 */
function resetQuery() {
  dateRange.value = [];
  proxy.resetForm("queryRef");
  queryParams.value.deptId = undefined;
  proxy.$refs.deptTreeRef.setCurrentKey(null);
  handleQuery();
};
/** 삭제버튼작업 */
function handleDelete(row) {
  const userIds = row.userId || ids.value;
  proxy.$modal.confirm('삭제하시겠습니까:사용자 번호: "' + userIds + '" 항목을 처리하시겠습니까?').then(function () {
    return delUser(userIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("삭제되었습니다.");
  }).catch(() => {});
};
/** 내보내기버튼작업 */
function handleExport() {
  proxy.download("system/user/export", {
    ...queryParams.value,
  },`user_${new Date().getTime()}.xlsx`);
};
/** 사용자 상태수정  */
function handleStatusChange(row) {
  let text = row.status === "1" ? "사용" : "사용 중지";
  proxy.$modal.confirm('변경하시겠습니까:"' + text + '""' + row.userName + '"사용자하시겠습니까?').then(function () {
    return changeUserStatus(row.userId, row.status);
  }).then(() => {
    proxy.$modal.msgSuccess(text + "성공");
  }).catch(function () {
    row.status = row.status === "0" ? "1" : "0";
  });
};
/** 更多작업 */
function handleCommand(command, row) {
  switch (command) {
    case "handleResetPwd":
      handleResetPwd(row);
      break;
    case "handleAuthRole":
      handleAuthRole(row);
      break;
    default:
      break;
  }
};
/** 跳转역할分配 */
function handleAuthRole(row) {
  const userId = row.userId;
  router.push("/system/user-auth/role/" + userId);
};
/** 비밀번호 초기화버튼작업 */
function handleResetPwd(row) {
  proxy.$prompt('입력해 주세요:"' + row.userName + '"의 새 비밀번호', "안내", {
    confirmButtonText: "확인",
    cancelButtonText: "취소",
    closeOnClickModal: false,
    inputPattern: /^.{5,20}$/,
    inputErrorMessage: "사용자 비밀번호 허용 길이: 5 ~ 20 사이",
  }).then(({ value }) => {
    resetUserPwd(row.userId, value).then(response => {
      proxy.$modal.msgSuccess("비밀번호가 변경되었습니다. 새 비밀번호:" + value);
    });
  }).catch(() => {});
};
/** 선택条数  */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.userId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};
/** 가져오기버튼작업 */
function handleImport() {
  upload.title = "사용자 가져오기";
  upload.open = true;
};
/** 양식 다운로드작업 */
function importTemplate() {
  proxy.download("system/user/importTemplate", {
  }, `user_template_${new Date().getTime()}.xlsx`);
};
/**파일 업로드中处理 */
const handleFileUploadProgress = (event, file, fileList) => {
  upload.isUploading = true;
};
/** 파일 업로드성공处理 */
const handleFileSuccess = (response, file, fileList) => {
  upload.open = false;
  upload.isUploading = false;
  proxy.$refs["uploadRef"].handleRemove(file);
  proxy.$alert("<div style='overflow: auto;overflow-x: hidden;max-height: 70vh;padding: 10px 20px 0;'>" + response.msg + "</div>", "가져오기 결과", { dangerouslyUseHTMLString: true });
  getList();
};
/** 저장파일 업로드 */
function submitFileForm() {
  proxy.$refs["uploadRef"].submit();
};
/** 초기화작업表单 */
function reset() {
  form.value = {
    userId: undefined,
    deptId: undefined,
    userName: undefined,
    nickName: undefined,
    password: undefined,
    phonenumber: undefined,
    email: undefined,
    sex: undefined,
    status: "1",
    remark: undefined,
    postIds: [],
    roleIds: []
  };
  proxy.resetForm("userRef");
};
/** 취소버튼 */
function cancel() {
  open.value = false;
  reset();
};
/** 추가버튼작업 */
function handleAdd() {
  reset();
  getUser().then(response => {
    postOptions.value = response.data.posts;
    roleOptions.value = response.data.roles;
    open.value = true;
    title.value = "추가사용자";
    form.value.password = initPassword.value;
  });
};
/** 수정버튼작업 */
function handleUpdate(row) {
  reset();
  const userId = row.userId || ids.value;
  getUser(userId).then(response => {
    form.value = response.data.user;
    postOptions.value = response.data.posts;
    roleOptions.value = response.data.roles;
    form.value.postIds = response.data.postIds;
    form.value.roleIds = response.data.roleIds;
    open.value = true;
    title.value = "수정사용자";
    form.password = "";
  });
};
/** 저장버튼 */
function submitForm() {
  proxy.$refs["userRef"].validate(valid => {
    if (valid) {
      if (form.value.userId != undefined) {
        updateUser(form.value).then(response => {
          proxy.$modal.msgSuccess("수정되었습니다.");
          open.value = false;
          getList();
        });
      } else {
        addUser(form.value).then(response => {
          proxy.$modal.msgSuccess("등록되었습니다.");
          open.value = false;
          getList();
        });
      }
    }
  });
};

getDeptTree();
getList();
proxy.getConfigKey("sys.user.initPassword").then(response => {
  initPassword.value = response.msg;
});
</script>
