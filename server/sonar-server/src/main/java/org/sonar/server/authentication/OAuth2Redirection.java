/*
 * SonarQube
 * Copyright (C) 2009-2017 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
package org.sonar.server.authentication;

import static org.apache.commons.lang.StringUtils.isBlank;
import static org.sonar.server.authentication.Cookies.findCookie;
import static org.sonar.server.authentication.Cookies.newCookieBuilder;

import java.util.Optional;

import javax.annotation.CheckForNull;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class OAuth2Redirection {

  private static final String REDIRECT_TO_COOKIE = "REDIRECT_TO";
  private static final String RETURN_TO_PARAMETER = "return_to";

  public void create(HttpServletRequest request, HttpServletResponse response) {
    String redirectTo = request.getParameter(RETURN_TO_PARAMETER);
    if (isBlank(redirectTo)) {
      return;
    }
    response.addCookie(newCookieBuilder(request)
      .setName(REDIRECT_TO_COOKIE)
      .setValue(redirectTo)
      .setHttpOnly(true)
      .setExpiry(-1)
      .build());
  }

  @CheckForNull
  public String getAndDelete(HttpServletRequest request, HttpServletResponse response) {
    Optional<Cookie> cookie = findCookie(REDIRECT_TO_COOKIE, request);
    if (!cookie.isPresent()) {
      return null;
    }

    delete(request, response);

    String redirectTo = cookie.get().getValue();
    if (isBlank(redirectTo)) {
      return null;
    }
    return redirectTo;
  }

  public void delete(HttpServletRequest request, HttpServletResponse response) {
    response.addCookie(newCookieBuilder(request)
      .setName(REDIRECT_TO_COOKIE)
      .setValue(null)
      .setHttpOnly(true)
      .setExpiry(0)
      .build());
  }

}
