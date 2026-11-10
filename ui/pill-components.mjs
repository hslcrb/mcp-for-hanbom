/**
 * Accessible, server-rendered pill components.
 * All navigation elements are generated from the official BOARD_CATALOG / MENU_CATALOG.
 * A <hanbom-pill> host upgrades to a native custom element in the browser. The
 * nested <button> keeps the navigation usable and accessible before hydration.
 */
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({
  "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
})[char]);

const safeId = value => {
  const id = String(value);
  if (!/^[a-z][a-z0-9_]*$/.test(id)) throw new Error("INVALID_PILL_CATEGORY");
  return id;
};

/**
 * Single reusable pill: native button semantics, controlled pressed state.
 * @param {{id:string,label:string,selected?:boolean}} props
 */
export function PillButton({id,label,selected=false}) {
  const key = safeId(id);
  const pressed = !!selected;
  return '<hanbom-pill'+(pressed?' selected':'')+'>'+
    '<button class="pill-button" type="button" data-category="'+key+
    '" aria-controls="notices" aria-pressed="'+String(pressed)+'">'+escapeHtml(label)+'</button>'+
    '</hanbom-pill>';
}

/**
 * A composable flex-wrap group; each secondary group is hidden until selected.
 * @param {{label:string,pills:Array,level?:"primary"|"secondary",id?:string}} props
 */
export function PillGroup({label,pills,level="primary",id}) {
  if (level!=="primary"&&level!=="secondary") throw new Error("INVALID_PILL_GROUP");
  const secondary = level==="secondary";
  const group = secondary ? ' data-group="'+safeId(id)+'" hidden' : '';
  return '<nav class="filters '+(secondary?"subfilters":"primary")+
    '" aria-label="'+escapeHtml(label)+'"'+group+'>'+
    '<div class="pill-layout">'+pills.map(PillButton).join("")+'</div>'+
    '</nav>';
}

/**
 * Compound navigation component. Every sub-board belongs to exactly one
 * source-defined menu; duplicate labels across menus remain distinct IDs.
 */
export function PillNavigation({menus,boards}) {
  const byId = new Map(boards.map(board=>[board.id,board]));
  if (new Set(boards.map(board=>board.id)).size!==boards.length) {
    throw new Error("DUPLICATE_BOARD_ID");
  }
  const primary=PillGroup({
    label:"상위 메뉴",
    pills:[{id:"all",label:"전체 보기",selected:true},
      ...menus.map(menu=>({id:menu.id,label:menu.label}))]
  });
  const secondary=menus.map(menu=>{
    const children=menu.ids.map(id=>{
      const board=byId.get(id);
      if(!board)throw new Error("UNKNOWN_BOARD_ID");
      return{id:board.id,label:board.label};
    });
    return PillGroup({
      id:menu.id,level:"secondary",label:menu.label+" 하위 게시판",
      pills:[{id:menu.id,label:"전체 보기"},...children]
    });
  }).join("");
  return '<div id="board-navigation" class="board-navigation">'+primary+secondary+'</div>';
}
