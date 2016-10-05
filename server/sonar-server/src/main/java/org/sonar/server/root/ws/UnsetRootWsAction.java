/*
 * SonarQube
 * Copyright (C) 2009-2016 SonarSource SA
 * mailto:contact AT sonarsource DOT com
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
package org.sonar.server.root.ws;

import org.sonar.api.server.ws.Request;
import org.sonar.api.server.ws.Response;
import org.sonar.api.server.ws.WebService;
import org.sonar.db.DbClient;
import org.sonar.db.DbSession;
import org.sonar.server.exceptions.BadRequestException;
import org.sonar.server.user.UserSession;

public class UnsetRootWsAction implements RootWsAction {
  private static final String PARAM_LOGIN = "login";

  private final UserSession userSession;
  private final DbClient dbClient;

  public UnsetRootWsAction(UserSession userSession, DbClient dbClient) {
    this.userSession = userSession;
    this.dbClient = dbClient;
  }

  @Override
  public void define(WebService.NewController controller) {
    WebService.NewAction action = controller.createAction("unset_root")
      .setInternal(true)
      .setPost(true)
      .setDescription("Make the specified user not root.<br/>" +
        "Requires to be root.")
      .setSince("6.2")
      .setHandler(this);

    action.createParam(PARAM_LOGIN)
      .setDescription("A user login")
      .setExampleValue("admin")
      .setRequired(true)
      .setSince("6.2");
  }

  @Override
  public void handle(Request request, Response response) throws Exception {
    userSession.checkIsRoot();

    String login = request.mandatoryParam(PARAM_LOGIN);
    try (DbSession dbSession = dbClient.openSession(false)) {
      if (dbClient.userDao().countRootUsersButLogin(dbSession, login) == 0) {
        throw new BadRequestException("Last root can't be unset");
      }
      dbClient.userDao().setRoot(dbSession, login, false);
      dbSession.commit();
    }
    response.noContent();
  }
}
