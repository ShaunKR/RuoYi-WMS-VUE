<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
         <el-form-item label="메뉴명" prop="menuName">
            <el-input
               v-model="queryParams.menuName"
               placeholder="입력해 주세요:메뉴명"
               clearable
               style="width: 200px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="상태" prop="status">
            <el-select v-model="queryParams.status" placeholder="메뉴 상태" clearable style="width: 200px">
               <el-option
                  v-for="dict in sys_normal_disable"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
               />
            </el-select>
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
               v-hasPermi="['system:menu:add']"
            >추가</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="info"
               plain
               icon="Sort"
               @click="toggleExpandAll"
            >펼치기 / 접기</el-button>
         </el-col>
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table
         v-if="refreshTable"
         v-loading="loading"
         :data="menuList"
         row-key="menuId"
         :default-expand-all="isExpandAll"
         :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      >
         <el-table-column prop="menuName" label="메뉴명" :show-overflow-tooltip="true" width="160"></el-table-column>
         <el-table-column prop="icon" label="아이콘" align="center" width="100">
            <template #default="scope">
               <svg-icon :icon-class="scope.row.icon" />
            </template>
         </el-table-column>
         <el-table-column prop="orderNum" label="정렬" width="60"></el-table-column>
         <el-table-column prop="perms" label="권한 식별자" :show-overflow-tooltip="true"></el-table-column>
         <el-table-column prop="component" label="컴포넌트 경로" :show-overflow-tooltip="true"></el-table-column>
         <el-table-column prop="status" label="상태" width="80">
            <template #default="scope">
               <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
            </template>
         </el-table-column>
         <el-table-column label="등록 일시" align="center" width="160" prop="createTime">
            <template #default="scope">
               <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
         </el-table-column>
         <el-table-column label="작업" align="center" width="210" class-name="small-padding fixed-width">
            <template #default="scope">
               <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:menu:edit']">수정</el-button>
               <el-button link type="primary" icon="Plus" @click="handleAdd(scope.row)" v-hasPermi="['system:menu:add']">추가</el-button>
               <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:menu:remove']">삭제</el-button>
            </template>
         </el-table-column>
      </el-table>

      <!-- 添加或修改菜单对话框 -->
      <el-dialog :title="title" v-model="open" width="680px" append-to-body>
         <el-form ref="menuRef" :model="form" :rules="rules" label-width="100px">
            <el-row>
               <el-col :span="24">
                  <el-form-item label="상위 메뉴">
                     <el-tree-select
                        v-model="form.parentId"
                        :data="menuOptions"
                        :props="{ value: 'menuId', label: 'menuName', children: 'children' }"
                        value-key="menuId"
                        placeholder="선택상위 메뉴"
                        check-strictly
                     />
                  </el-form-item>
               </el-col>
               <el-col :span="24">
                  <el-form-item label="메뉴 유형" prop="menuType">
                     <el-radio-group v-model="form.menuType">
                        <el-radio label="M">폴더</el-radio>
                        <el-radio label="C">메뉴</el-radio>
                        <el-radio label="F">버튼</el-radio>
                     </el-radio-group>
                  </el-form-item>
               </el-col>
               <el-col :span="24" v-if="form.menuType != 'F'">
                  <el-form-item label="메뉴 아이콘" prop="icon">
                     <el-popover
                        placement="bottom-start"
                        :width="540"
                        v-model:visible="showChooseIcon"
                        trigger="click"
                        @show="showSelectIcon"
                     >
                        <template #reference>
                           <el-input v-model="form.icon" placeholder="아이콘을 선택해 주세요." @blur="showSelectIcon" v-click-outside="hideSelectIcon" readonly>
                              <template #prefix>
                                 <svg-icon
                                    v-if="form.icon"
                                    :icon-class="form.icon"
                                    class="el-input__icon"
                                    style="height: 32px;width: 16px;"
                                 />
                                 <el-icon v-else style="height: 32px;width: 16px;"><search /></el-icon>
                              </template>
                           </el-input>
                        </template>
                        <icon-select ref="iconSelectRef" @selected="selected" :active-icon="form.icon" />
                     </el-popover>
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="메뉴명" prop="menuName">
                     <el-input v-model="form.menuName" placeholder="입력해 주세요:메뉴명" />
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item label="표시 순서" prop="orderNum">
                     <el-input-number v-model="form.orderNum" controls-position="right" :min="0" />
                  </el-form-item>
               </el-col>
               <el-col :span="12" v-if="form.menuType != 'F'">
                  <el-form-item>
                     <template #label>
                        <span>
                           <el-tooltip content="외부 링크 주소는 http:// 또는 https://로 시작해야 합니다." placement="top">
                              <el-icon><question-filled /></el-icon>
                           </el-tooltip>외부 링크 여부
                        </span>
                     </template>
                     <el-radio-group v-model="form.isFrame">
                        <el-radio label="1">예</el-radio>
                        <el-radio label="0">아니요</el-radio>
                     </el-radio-group>
                  </el-form-item>
               </el-col>
               <el-col :span="12" v-if="form.menuType != 'F'">
                  <el-form-item prop="path">
                     <template #label>
                        <span>
                           <el-tooltip content="라우트 주소를 입력하세요. 예: user. 외부 주소는 http:// 또는 https://로 시작해야 합니다." placement="top">
                              <el-icon><question-filled /></el-icon>
                           </el-tooltip>
                           라우트 주소
                        </span>
                     </template>
                     <el-input v-model="form.path" placeholder="입력해 주세요:라우트 주소" />
                  </el-form-item>
               </el-col>
               <el-col :span="12" v-if="form.menuType == 'C'">
                  <el-form-item prop="component">
                     <template #label>
                        <span>
                           <el-tooltip content="views 폴더 기준 컴포넌트 경로. 예: system/user/index" placement="top">
                              <el-icon><question-filled /></el-icon>
                           </el-tooltip>
                           컴포넌트 경로
                        </span>
                     </template>
                     <el-input v-model="form.component" placeholder="입력해 주세요:컴포넌트 경로" />
                  </el-form-item>
               </el-col>
               <el-col :span="12" v-if="form.menuType != 'M'">
                  <el-form-item>
                     <el-input v-model="form.perms" placeholder="입력해 주세요:권한 식별자" maxlength="100" />
                     <template #label>
                        <span>
                           <el-tooltip content="서버에서 정의한 권한 문자열. 예:@SaCheckPermission('system:user:list')" placement="top">
                              <el-icon><question-filled /></el-icon>
                           </el-tooltip>
                           권한 문자열
                        </span>
                     </template>
                  </el-form-item>
               </el-col>
               <el-col :span="12" v-if="form.menuType == 'C'">
                  <el-form-item>
                     <el-input v-model="form.queryParam" placeholder="입력해 주세요:라우트 매개변수" maxlength="255" />
                     <template #label>
                        <span>
                           <el-tooltip content='라우트에 전달할 기본 매개변수. 예:`{"id": 1, "name": "ry"}`' placement="top">
                              <el-icon><question-filled /></el-icon>
                           </el-tooltip>
                           라우트 매개변수
                        </span>
                     </template>
                  </el-form-item>
               </el-col>
               <el-col :span="12" v-if="form.menuType == 'C'">
                  <el-form-item>
                     <template #label>
                        <span>
                           <el-tooltip content="캐시를 사용하려면 컴포넌트 name과 라우트 이름이 일치해야 합니다." placement="top">
                              <el-icon><question-filled /></el-icon>
                           </el-tooltip>
                           캐시 사용 여부
                        </span>
                     </template>
                     <el-radio-group v-model="form.isCache">
                        <el-radio label="1">캐시</el-radio>
                        <el-radio label="0">캐시 사용 안 함</el-radio>
                     </el-radio-group>
                  </el-form-item>
               </el-col>
               <el-col :span="12" v-if="form.menuType != 'F'">
                  <el-form-item>
                     <template #label>
                        <span>
                           <el-tooltip content="숨기면 사이드바에 표시되지 않지만 주소로 접근할 수 있습니다." placement="top">
                              <el-icon><question-filled /></el-icon>
                           </el-tooltip>
                           표시 상태
                        </span>
                     </template>
                     <el-radio-group v-model="form.visible">
                        <el-radio
                           v-for="dict in sys_show_hide"
                           :key="dict.value"
                           :label="dict.value"
                        >{{ dict.label }}</el-radio>
                     </el-radio-group>
                  </el-form-item>
               </el-col>
               <el-col :span="12">
                  <el-form-item>
                     <template #label>
                        <span>
                           <el-tooltip content="사용 중지하면 사이드바에 표시되지 않고 접근도 차단됩니다." placement="top">
                              <el-icon><question-filled /></el-icon>
                           </el-tooltip>
                           메뉴 상태
                        </span>
                     </template>
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
         </el-form>
         <template #footer>
            <div class="dialog-footer">
               <el-button type="primary" @click="submitForm">확인</el-button>
               <el-button @click="cancel">취소</el-button>
            </div>
         </template>
      </el-dialog>
   </div>
</template>

<script setup name="Menu">
import { addMenu, delMenu, getMenu, listMenu, updateMenu } from "@/api/system/menu";
import SvgIcon from "@/components/SvgIcon";
import IconSelect from "@/components/IconSelect";
import { ClickOutside as vClickOutside } from 'element-plus'

const { proxy } = getCurrentInstance();
const { sys_show_hide, sys_normal_disable } = proxy.useDict("sys_show_hide", "sys_normal_disable");

const menuList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const title = ref("");
const menuOptions = ref([]);
const isExpandAll = ref(false);
const refreshTable = ref(true);
const showChooseIcon = ref(false);
const iconSelectRef = ref(null);

const data = reactive({
  form: {},
  queryParams: {
    menuName: undefined,
    visible: undefined
  },
  rules: {
    menuName: [{ required: true, message: "메뉴명항목은 필수입니다.", trigger: "blur" }],
    orderNum: [{ required: true, message: "메뉴 순서항목은 필수입니다.", trigger: "blur" }],
    path: [{ required: true, message: "라우트 주소항목은 필수입니다.", trigger: "blur" }]
  },
});

const { queryParams, form, rules } = toRefs(data);

/** 조회메뉴列表 */
function getList() {
  loading.value = true;
  listMenu(queryParams.value).then(response => {
    menuList.value = proxy.handleTree(response.data, "menuId");
    loading.value = false;
  });
}
/** 조회메뉴下拉树结构 */
function getTreeselect() {
  menuOptions.value = [];
  listMenu().then(response => {
    const menu = { menuId: 0, menuName: "최상위 메뉴", children: [] };
    menu.children = proxy.handleTree(response.data, "menuId");
    menuOptions.value.push(menu);
  });
}
/** 취소버튼 */
function cancel() {
  open.value = false;
  reset();
}
/** 表单초기화 */
function reset() {
  form.value = {
    menuId: undefined,
    parentId: 0,
    menuName: undefined,
    icon: undefined,
    menuType: "M",
    orderNum: undefined,
    isFrame: "0",
    isCache: "0",
    visible: "1",
    status: "1"
  };
  proxy.resetForm("menuRef");
}
/** 展示下拉아이콘 */
function showSelectIcon() {
  iconSelectRef.value.reset();
  showChooseIcon.value = true;
}
/** 선택아이콘 */
function selected(name) {
  form.value.icon = name;
  showChooseIcon.value = false;
}
/** 아이콘外层点击숨기기下拉列表 */
function hideSelectIcon(event) {
  var elem = event.relatedTarget || event.srcElement || event.target || event.currentTarget;
  var className = elem.className;
  if (className !== "el-input__inner") {
    showChooseIcon.value = false;
  }
}
/** 검색버튼작업 */
function handleQuery() {
  getList();
}
/** 초기화버튼작업 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}
/** 추가버튼작업 */
function handleAdd(row) {
  reset();
  getTreeselect();
  if (row != null && row.menuId) {
    form.value.parentId = row.menuId;
  } else {
    form.value.parentId = 0;
  }
  open.value = true;
  title.value = "추가메뉴";
}
/** 펼치기 / 접기작업 */
function toggleExpandAll() {
  refreshTable.value = false;
  isExpandAll.value = !isExpandAll.value;
  nextTick(() => {
    refreshTable.value = true;
  });
}
/** 수정버튼작업 */
async function handleUpdate(row) {
  reset();
  await getTreeselect();
  getMenu(row.menuId).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "수정메뉴";
  });
}
/** 저장버튼 */
function submitForm() {
  proxy.$refs["menuRef"].validate(valid => {
    if (valid) {
      if (form.value.menuId != undefined) {
        updateMenu(form.value).then(response => {
          proxy.$modal.msgSuccess("수정되었습니다.");
          open.value = false;
          getList();
        });
      } else {
        addMenu(form.value).then(response => {
          proxy.$modal.msgSuccess("등록되었습니다.");
          open.value = false;
          getList();
        });
      }
    }
  });
}
/** 삭제버튼작업 */
function handleDelete(row) {
  proxy.$modal.confirm('삭제하시겠습니까:이름: "' + row.menuName + '" 항목을 처리하시겠습니까?').then(function() {
    return delMenu(row.menuId);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("삭제되었습니다.");
  }).catch(() => {});
}

getList();
</script>
