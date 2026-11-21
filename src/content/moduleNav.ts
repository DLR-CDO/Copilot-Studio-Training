import { modules } from './modules'

/** Module number and title for menus and lists, always in step with the module content. */
export const MODULE_NAV = modules.map(({ id, slug, title }) => ({ id, slug, title }))
