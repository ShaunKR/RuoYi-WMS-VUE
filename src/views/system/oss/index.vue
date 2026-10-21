<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="파일명" prop="fileName">
        <el-input
          v-model="queryParams.fileName"
          placeholder="입력해 주세요:파일명"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="원래 이름" prop="originalName">
        <el-input
          v-model="queryParams.originalName"
          placeholder="입력해 주세요:원래 이름"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="파일 확장자" prop="fileSuffix">
        <el-input
          v-model="queryParams.fileSuffix"
          placeholder="입력해 주세요:파일 확장자"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="등록 일시">
        <el-date-picker
          v-model="daterangeCreateTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          range-separator="-"
          start-placeholder="시작일"
          end-placeholder="종료일"
          :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="업로드 사용자" prop="createBy">
        <el-input
          v-model="queryParams.createBy"
          placeholder="입력해 주세요:업로드 사용자"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="서비스 제공자" prop="service">
        <el-input
          v-model="queryParams.service"
          placeholder="입력해 주세요:서비스 제공자"
          clearable
          style="width: 200px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="search" @click="handleQuery">검색</el-button>
        <el-button icon="Refresh" @click="resetQuery">초기화</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleFile"
          v-hasPermi="['system:oss:upload']"
        >파일 업로드</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleImage"
          v-hasPermi="['system:oss:upload']"
        >이미지 업로드</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:oss:remove']"
        >삭제</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          :type="previewListResource ? 'danger' : 'warning'"
          plain
          @click="handlePreviewListResource(!previewListResource)"
          v-hasPermi="['system:oss:edit']"
        >미리보기 사용 : {{previewListResource ? "사용 안 함" : "사용"}}</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="info"
          plain
          icon="Operation"
          @click="handleOssConfig"
          v-hasPermi="['system:oss:list']"
        >설정 관리</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="ossList" @selection-change="handleSelectionChange"
              :header-cell-class-name="handleHeaderClass"
              @header-click="handleHeaderCLick"
              v-if="showTable">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="객체 스토리지 ID" align="center" prop="ossId" v-if="false"/>
      <el-table-column label="파일명" align="center" prop="fileName" />
      <el-table-column label="원래 이름" align="center" prop="originalName" />
      <el-table-column label="파일 확장자" align="center" prop="fileSuffix" />
      <el-table-column label="파일 표시" align="center" prop="url">
        <template #default="scope">
          <ImagePreview
            v-if="previewListResource && checkFileSuffix(scope.row.fileSuffix)"
            :width="100" :height="100"
            :src="scope.row.url"
            :preview-src-list="[scope.row.url]"/>
          <span v-text="scope.row.url"
                v-if="!checkFileSuffix(scope.row.fileSuffix) || !previewListResource"/>
        </template>
      </el-table-column>
      <el-table-column label="등록 일시" align="center" prop="createTime" width="180" sortable="custom">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="업로드 사용자" align="center" prop="createBy" />
      <el-table-column label="서비스 제공자" align="center" prop="service" sortable="custom"/>
      <el-table-column label="작업" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleDownload(scope.row)" v-hasPermi="['system:oss:download']">다운로드</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:oss:remove']">삭제</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改OSS对象存储对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="ossRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="파일명">
          <fileUpload v-model="form.file" v-if="type === 0"/>
          <imageUpload v-model="form.file" v-if="type === 1"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">확인</el-button>
          <el-button @click="cancel">취소</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Oss">
import { listOss, delOss } from "@/api/system/oss";
import ImagePreview from "@/components/ImagePreview/index.vue";

const router = useRouter();
const { proxy } = getCurrentInstance();

const ossList = ref([]);
const open = ref(false);
const showTable = ref(true);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const type = ref(0);
const previewListResource = ref(true);
const daterangeCreateTime = ref([]);
// 默认排序
const defaultSort = ref({prop: 'createTime', order: 'ascending'});

const data = reactive({
  form: {},
  // 查询参数
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    fileName: undefined,
    originalName: undefined,
    fileSuffix: undefined,
    url: undefined,
    createTime: undefined,
    createBy: undefined,
    service: undefined
  },
  rules: {
    file: [
      { required: true, message: "파일을 선택해 주세요.", trigger: "blur" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 조회OSS对象存储列表 */
function getList() {
  loading.value = true;
  proxy.getConfigKey("sys.oss.previewListResource").then(response => {
    previewListResource.value = response.msg === undefined ? true : response.msg === 'true';
  });
  listOss(proxy.addDateRange(queryParams.value, daterangeCreateTime.value, "CreateTime")).then(response => {
    ossList.value = response.rows;
    total.value = response.total;
    loading.value = false;
    showTable.value = true;
  });
}
function checkFileSuffix(fileSuffix) {
  let arr = ["png", "jpg", "jpeg"];
  return arr.some(type => {
    return fileSuffix.indexOf(type) > -1;
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
    file: undefined,
  };
  proxy.resetForm("ossRef");
}
/** 검색버튼작업 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}
/** 초기화버튼작업 */
function resetQuery() {
  showTable.value = false;
  daterangeCreateTime.value = [];
  proxy.resetForm("queryRef");
  queryParams.value.orderByColumn = defaultSort.value.prop;
  queryParams.value.isAsc = defaultSort.value.order;
  handleQuery();
}
/** 선택条数  */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.ossId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}
// 设置列的排序为我们自定义的排序
function handleHeaderClass({column}) {
  column.order = column.multiOrder
}
// 点击表头进行排序
function handleHeaderCLick(column) {
  if (column.sortable !== 'custom') {
    return
  }
  switch (column.multiOrder) {
    case 'descending':
      column.multiOrder = 'ascending';
      break;
    case 'ascending':
      column.multiOrder = '';
      break;
    default:
      column.multiOrder = 'descending';
      break;
  }
  handleOrderChange(column.property, column.multiOrder)
}
function handleOrderChange(prop, order) {
  let orderByArr = queryParams.value.orderByColumn ? queryParams.value.orderByColumn.split(",") : [];
  let isAscArr = queryParams.value.isAsc ? queryParams.value.isAsc.split(",") : [];
  let propIndex = orderByArr.indexOf(prop)
  if (propIndex !== -1) {
    if (order) {
      //排序里已存在 只修改排序
      isAscArr[propIndex] = order;
    } else {
      //如果order为null 则删除排序字段和属性
      isAscArr.splice(propIndex, 1);//삭제정렬
      orderByArr.splice(propIndex, 1);//삭제属性
    }
  } else {
    //排序里不存在则新增排序
    orderByArr.push(prop);
    isAscArr.push(order);
  }
  //合并排序
  queryParams.value.orderByColumn = orderByArr.join(",");
  queryParams.value.isAsc = isAscArr.join(",");
  getList();
}
/** 任务日志列表조회 */
function handleOssConfig() {
  router.push('/system/oss-config/index')
}
/** 파일버튼작업 */
function handleFile() {
  reset();
  open.value = true;
  title.value = "파일 업로드";
  type.value = 0;
}
/** 이미지버튼작업 */
function handleImage() {
  reset();
  open.value = true;
  title.value = "이미지 업로드";
  type.value = 1;
}
/** 저장버튼 */
function submitForm() {
  open.value = false;
  getList();
}
/** 다운로드버튼작업 */
function handleDownload(row) {
  proxy.$download.oss(row.ossId)
}
/** 사용자 상태수정  */
function handlePreviewListResource(previewListResource) {
  let text = previewListResource ? "사용" : "사용 중지";
  proxy.$modal.confirm('변경하시겠습니까:"' + text + '""목록 이미지 미리보기"설정하시겠습니까?').then(() => {
    return proxy.updateConfigByKey("sys.oss.previewListResource", previewListResource);
  }).then(() => {
    getList()
    proxy.$modal.msgSuccess(text + "성공");
  }).catch(() => {});
}
/** 삭제버튼작업 */
function handleDelete(row) {
  const ossIds = row.ossId || ids.value;
  proxy.$modal.confirm('삭제하시겠습니까:OSS객체 스토리지 번호:"' + ossIds + '" 항목을 처리하시겠습니까?').then(() => {
    loading.value = true;
    return delOss(ossIds);
  }).then(() => {
    loading.value = false;
    getList();
    proxy.$modal.msgSuccess("삭제되었습니다.");
  }).finally(() => {
    loading.value = false;
  });
}

getList();
</script>
