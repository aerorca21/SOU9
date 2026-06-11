/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
