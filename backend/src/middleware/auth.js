'use strict';
const { UnauthorizedError, ForbiddenError } = require('../utils/errors');
const { supabase, getUserFromAccessToken } = require('../config/supabase');

/**
 * Verify Supabase access token from Authorization: Bearer <token>
 * Attaches req.user = { sub, email, role?, displayName? }
 */
async function authenticate(req, res, next) {
  try {
    const hdr = req.headers.authorization || '';
    const [scheme, token] = hdr.split(' ');
    if (scheme !== 'Bearer' || !token) {
      return next(new UnauthorizedError('Missing or invalid Authorization header'));
    }

    const sbUser = await getUserFromAccessToken(token);
    if (!sbUser) return next(new UnauthorizedError('Invalid or expired token'));

    // Base identity from Supabase Auth
    const authUser = { sub: sbUser.id, email: sbUser.email };

    // Optional: augment with role from public.users profile table
    const { data: profile } = await supabase
      .from('users')
      .select('role, display_name')
      .eq('id', sbUser.id)
      .single();

    if (profile) {
      authUser.role = profile.role || authUser.role;
      authUser.displayName = profile.display_name || authUser.displayName;
    }

    req.user = authUser;
    return next();
  } catch (err) {
    return next(new UnauthorizedError('Unauthorized'));
  }
}

/**
 * Authorize by role (simple RBAC)
 * @param  {...string} roles
 * @returns 
 */
function authorize(...roles) {
  return function (req, res, next) {
    if (!req.user) return next(new UnauthorizedError());
    if (roles.length === 0) return next();
    if (!req.user.role || !roles.includes(req.user.role)) {
      return next(new ForbiddenError('Insufficient permissions'));
    }
    return next();
  };
}

module.exports = {
  authenticate,
  authorize,
};
