(function(){
	//自适应宽高
	var section = document.querySelector('#section');
	var head = document.querySelector('#head');
	function resize(){
		var clientH = document.documentElement.clientHeight;
		section.style.height = clientH - head.offsetHeight+'px';
	}
	window.onresize = resize;
	resize();
//数据操作的方法
let init_id = -1;
let d = data.files;
//找到所有pid为-1的

//通过当前数据的id获取所有的子级
// child = d.filter((item)=>{
// 	if(item.pid == init_id){
// 		return true;
// 	}else{
// 		return false;
// 	}	
// });
// child = d.filter((item)=>(item.pid == init_id));

//通过id找到当前元素下的子级
function getChildById(d,id){
	return  d.filter((item)=>(item.pid == id));
}
//通过当前id获取当前这组数据
function getSelfById(d,id){
	return d.filter((item)=>(item.id == id))[0];
}

// 已知当前id，获取当前项的所有父级
function getParentById(d,id){
	let self = getSelfById(d,id);
	let parents = [];
	let parent = d.filter((item)=>(item.id == self.pid))[0];	
	if(parent){
		parents.push(parent);
		parents = parents.concat(getParentById(d,parent.id));
	}	
	return parents;
}

// 视图渲染
// 菜单渲染
let showNowId = getChildById(d,init_id)[0].id;  //当前选中项的id
let treeMenu = document.querySelector('.tree-menu');
let level = -1;
function createMenuHtml(d,id,level){
	level++;
	return  `<ul>
				${getChildById(d,id).map((item)=>{					
					let child = getChildById(d,item.id);
					let childHTML = child.length > 0?createMenuHtml(d,item.id,level):"";
					return `<li>
								<div data-id="${item.id}" style="padding-left:${level*20}px" class="tree-title ${childHTML?"tree-ico":""} close">
									<span><i></i>${item.title}</span>
								</div>
								${childHTML}
							</li>`;
				}).join("")}	
			</ul> `;
}
treeMenu.innerHTML = createMenuHtml(d,init_id,level);

// 导航渲染
function createNav(d,id){
	let breadNav=document.querySelector('.bread-nav');
	function getNavHtml(d,id){
		let self = getSelfById(d,id);
		let parents = getParentById(d,id).reverse();
		let parentsHtml = parents.map((item)=>`<a href="javascript:;" data-id="${item.id}">${item.title}</a>`).join("");
		// console.log(parentsHtml)
		return parentsHtml + `<span>${self.title}</span>`; 
	}
	breadNav.innerHTML=getNavHtml(d,id);
}
createNav(d,showNowId);

//文件夹区域的渲染
function creatFoldersHtml(d,id){
	let folders = document.querySelector('.folders');
	let fEmpty = document.querySelector('.f-empty');
	function getFoldersHtml(d,id){
		let child = getChildById(d,id);
		let childHTML = child.map((item)=>{
			return `<div class="file-item" data-id="${item.id}">
					<img src="img/folder-b.png" alt="" />
					<span class="folder-name">${item.title}</span>
					<input type="text" class="editor"/>
					<i></i>
					</div>`;
		}).join("");
		return childHTML;
	}
	folders.innerHTML = getFoldersHtml(d,id);
	fEmpty.style.display = folders.innerHTML == ""?"block":"none";
}
creatFoldersHtml(d,showNowId)
// 添加3个区域，分别的交互
//菜单项的交互
//给当前项添加选中的class
function activeMenu(id){
	let treeMenu = document.querySelector('.tree-menu');
	let option = treeMenu.querySelectorAll('div');
	// showNowId表示当前选中项的id
	let activeOption = treeMenu.querySelector(`div[data-id='${id}']`);
	//div[data-id='0'] 属性选择器
	option.forEach((item)=>{
		item.classList.remove("active");
	});
	activeOption.classList.add('active');
}
activeMenu(showNowId);

//给所有菜单项添加点击切换视图
function addMenuEvent(){
	let treeMenu = document.querySelector('.tree-menu');
	let option = treeMenu.querySelectorAll('div');
	option.forEach((item)=>{
		item.onclick = function(){
			tabViewAll(d,this.dataset.id);	
		};
	});
}
addMenuEvent();

// 通过id重新修改所有视图
function tabViewAll(d,id){
	if(showNowId == id){
		//如果还是切换当前项目，就不重新渲染视图
		return;
	}
	activeMenu(id);
	//重新渲染视图
	createNav(d,id);
	creatFoldersHtml(d,id);

	//渲染完视图之后，重新添加事件
	addNavEvent();
	addFolderEvent();
}

//给导航添加点击事件
function addNavEvent(){
	let breadNav = document.querySelector('.bread-nav');
	let navs = breadNav.querySelectorAll("a");
	navs.forEach((item)=>{
		item.onclick=function(){
			tabViewAll(d,this.dataset.id);
		};		
	});
}
addNavEvent();

//获取当前选中的文件夹
function getSelectFolder(){
	let folders = document.querySelector('.folders');
	let fileItem = Array.from(folders.querySelectorAll('.file-item'));
	return fileItem.filter((item)=>(item.classList.contains("active")));
}

//判断文件夹是否全选
function isSelectAllFolder(){
	let folders = document.querySelector('.folders');
	let fileItem = folders.querySelectorAll('.file-item');
	return getSelectFolder().length == fileItem.length;
}

//给文件视图添加点击事件
function addFolderEvent(){
	let folders = document.querySelector('.folders');
	let fileItem =folders.querySelectorAll('.file-item');
	let checkedAll = document.querySelector(".checkedAll");
	fileItem.forEach((item)=>{
		let check = item.querySelector('i');
		item.onclick = function(){
			tabViewAll(d,this.dataset.id);
		};
		// 文件夹选中
		check.onclick = function(e){
			this.classList.toggle("checked");
			if(this.classList.contains("checked")){
				item.classList.add("active");
			}else{
				item.classList.remove("active");
			}
			if(isSelectAllFolder()){
				checkedAll.classList.add("checked");
			}else{
				checkedAll.classList.remove("checked");
			}
			e.stopPropagation();
		}

	});	
}
addFolderEvent();

})();